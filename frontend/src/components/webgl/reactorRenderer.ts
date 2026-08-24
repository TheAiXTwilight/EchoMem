import type { AssistantPhase } from "../../types/assistant";
import {
  CORE_FRAGMENT,
  CORE_VERTEX,
  PARTICLE_FRAGMENT,
  PARTICLE_VERTEX,
  RING_FRAGMENT,
  RING_VERTEX,
} from "./reactorShaders";

type ProgramInfo = {
  program: WebGLProgram;
  attributes: Record<string, number>;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

type Geometry = {
  buffer: WebGLBuffer;
  count: number;
};

type ParticleData = {
  values: Float32Array;
  positions: Array<[number, number, number]>;
  seeds: number[];
  edges: Array<[number, number]>;
};

const LATITUDE_RINGS = 13;
const LONGITUDE_SEGMENTS = 26;
const SPHERE_RADIUS = 0.83;
const IDLE_FRAME_MS = 1000 / 24;
const ACTIVE_FRAME_MS = 1000 / 30;
const TWO_PI = Math.PI * 2;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
  attributeNames: string[],
  uniformNames: string[],
): ProgramInfo {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unknown program link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  const attributes: Record<string, number> = {};
  for (const name of attributeNames) attributes[name] = gl.getAttribLocation(program, name);
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (const name of uniformNames) uniforms[name] = gl.getUniformLocation(program, name);
  return { program, attributes, uniforms };
}

function createBuffer(gl: WebGLRenderingContext, values: Float32Array): Geometry {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Unable to create WebGL buffer.");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
  return { buffer, count: 0 };
}

function makeRandom(seed = 0x4a415256) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Builds an upright triangulated spherical surface instead of a particle cloud.
 * Adjacent latitude rows are half-stepped and cross-linked, producing a dense
 * network of triangular facets that remains perfectly round in projection.
 */
function createParticleData(): ParticleData {
  const random = makeRandom();
  const positions: Array<[number, number, number]> = [];
  const seeds: number[] = [];
  const sizes: number[] = [];
  const kinds: number[] = [];
  const edges: Array<[number, number]> = [];
  const edgeKeys = new Set<string>();

  const addEdge = (first: number, second: number) => {
    const low = Math.min(first, second);
    const high = Math.max(first, second);
    const key = `${low}:${high}`;
    if (low === high || edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push([low, high]);
  };

  for (let latitudeIndex = 0; latitudeIndex < LATITUDE_RINGS; latitudeIndex += 1) {
    const latitudeRatio = (latitudeIndex + 1) / (LATITUDE_RINGS + 1);
    const baseLatitude = -Math.PI * 0.5 + latitudeRatio * Math.PI;
    const rowOffset = latitudeIndex % 2 === 0 ? 0 : 0.5;

    for (let longitudeIndex = 0; longitudeIndex < LONGITUDE_SEGMENTS; longitudeIndex += 1) {
      const angularJitter =
        Math.sin((latitudeIndex + 2) * (longitudeIndex + 3) * 0.71) * 0.045;
      const latitudeJitter =
        Math.sin((longitudeIndex + 1) * 1.73 + latitudeIndex * 0.47) * 0.008;
      const latitude = baseLatitude + latitudeJitter;
      const longitude =
        ((longitudeIndex + rowOffset + angularJitter) / LONGITUDE_SEGMENTS) * TWO_PI;
      const surfaceVariation =
        SPHERE_RADIUS *
        (0.992 + Math.sin(longitude * 3.0 + latitudeIndex * 0.81) * 0.008);
      const latitudeRadius = Math.cos(latitude) * surfaceVariation;

      positions.push([
        Math.cos(longitude) * latitudeRadius,
        Math.sin(latitude) * surfaceVariation,
        Math.sin(longitude) * latitudeRadius,
      ]);
      seeds.push(random() * 20 + positions.length * 0.013);
      sizes.push(1.55 + random() * 2.25);
      kinds.push(random() > 0.82 ? 1 : 0);
    }
  }

  const southPole = positions.length;
  positions.push([0, -SPHERE_RADIUS, 0]);
  seeds.push(23.7);
  sizes.push(3.2);
  kinds.push(1);

  const northPole = positions.length;
  positions.push([0, SPHERE_RADIUS, 0]);
  seeds.push(31.2);
  sizes.push(3.2);
  kinds.push(1);

  for (let latitudeIndex = 0; latitudeIndex < LATITUDE_RINGS; latitudeIndex += 1) {
    const rowStart = latitudeIndex * LONGITUDE_SEGMENTS;

    for (let longitudeIndex = 0; longitudeIndex < LONGITUDE_SEGMENTS; longitudeIndex += 1) {
      const current = rowStart + longitudeIndex;
      const around = rowStart + ((longitudeIndex + 1) % LONGITUDE_SEGMENTS);
      addEdge(current, around);

      if (latitudeIndex < LATITUDE_RINGS - 1) {
        const nextRow = rowStart + LONGITUDE_SEGMENTS;
        const direct = nextRow + longitudeIndex;
        const diagonalLongitude =
          (longitudeIndex + (latitudeIndex % 2 === 0 ? LONGITUDE_SEGMENTS - 1 : 1)) %
          LONGITUDE_SEGMENTS;
        const diagonal = nextRow + diagonalLongitude;
        addEdge(current, direct);
        addEdge(current, diagonal);
      }
    }
  }

  const firstRow = 0;
  const lastRow = (LATITUDE_RINGS - 1) * LONGITUDE_SEGMENTS;
  for (let longitudeIndex = 0; longitudeIndex < LONGITUDE_SEGMENTS; longitudeIndex += 1) {
    addEdge(southPole, firstRow + longitudeIndex);
    addEdge(northPole, lastRow + longitudeIndex);
  }

  const values = new Float32Array(positions.length * 6);
  positions.forEach((position, index) => {
    const offset = index * 6;
    values[offset] = position[0];
    values[offset + 1] = position[1];
    values[offset + 2] = position[2];
    values[offset + 3] = sizes[index];
    values[offset + 4] = seeds[index];
    values[offset + 5] = kinds[index];
  });

  return { values, positions, seeds, edges };
}

function createParticleGeometry(gl: WebGLRenderingContext, data: ParticleData): Geometry {
  const geometry = createBuffer(gl, data.values);
  geometry.count = data.positions.length;
  return geometry;
}

function pushThickLineSegment(
  values: number[],
  start: [number, number, number],
  startSeed: number,
  end: [number, number, number],
  endSeed: number,
  alpha: number,
  heat: number,
) {
  const pushVertex = (along: number, side: number) => {
    values.push(
      start[0],
      start[1],
      start[2],
      end[0],
      end[1],
      end[2],
      startSeed,
      endSeed,
      along,
      side,
      alpha,
      heat,
    );
  };

  pushVertex(0, -1);
  pushVertex(0, 1);
  pushVertex(1, -1);
  pushVertex(1, -1);
  pushVertex(0, 1);
  pushVertex(1, 1);
}

function createLineGeometry(gl: WebGLRenderingContext, data: ParticleData): Geometry {
  const random = makeRandom(0x0ec40ec4);
  const values: number[] = [];

  for (const [startIndex, endIndex] of data.edges) {
    const start = data.positions[startIndex];
    const end = data.positions[endIndex];
    const latitudeWeight = Math.abs((start[1] + end[1]) / (SPHERE_RADIUS * 2));
    const alpha = 0.29 + random() * 0.2 - latitudeWeight * 0.035;
    const heat = 0.58 + random() * 0.4;

    pushThickLineSegment(
      values,
      start,
      data.seeds[startIndex],
      end,
      data.seeds[endIndex],
      alpha,
      heat,
    );
  }

  const geometry = createBuffer(gl, new Float32Array(values));
  geometry.count = values.length / 12;
  return geometry;
}

function createCoreGeometry(gl: WebGLRenderingContext): Geometry {
  const geometry = createBuffer(gl, new Float32Array([0]));
  geometry.count = 1;
  return geometry;
}

function activityForPhase(phase: AssistantPhase) {
  switch (phase) {
    case "sleeping":
      return 0;
    case "listening":
      return 0.72;
    case "thinking":
      return 0.9;
    case "speaking":
      return 1;
    case "error":
      return 0.82;
    default:
      return 0.2;
  }
}

function isActivePhase(phase: AssistantPhase) {
  return phase === "listening" || phase === "thinking" || phase === "speaking" || phase === "error";
}

function bindFloatAttribute(
  gl: WebGLRenderingContext,
  location: number,
  size: number,
  stride: number,
  offset: number,
) {
  if (location < 0) return;
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
}

function setCommonUniforms(
  gl: WebGLRenderingContext,
  info: ProgramInfo,
  time: number,
  level: number,
  activity: number,
) {
  gl.uniform1f(info.uniforms.uTime, time);
  gl.uniform1f(info.uniforms.uLevel, level);
  gl.uniform1f(info.uniforms.uActivity, activity);
}

function disableAttributes(gl: WebGLRenderingContext, info: ProgramInfo) {
  for (const location of Object.values(info.attributes)) {
    if (location >= 0) gl.disableVertexAttribArray(location);
  }
}

/** Static buffers, shader-only movement, triangulated surface, and 3 draw calls. */
export class ReactorRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly particles: Geometry;
  private readonly lines: Geometry;
  private readonly core: Geometry;
  private readonly particleProgram: ProgramInfo;
  private readonly lineProgram: ProgramInfo;
  private readonly coreProgram: ProgramInfo;
  private readonly getLevel: () => number;
  private phase: AssistantPhase = "idle";
  private activity = 0.2;
  private level = 0;
  private elapsed = 0;
  private lastTick = 0;
  private lastDraw = 0;
  private frame = 0;
  private running = false;

  constructor(private readonly canvas: HTMLCanvasElement, getLevel: () => number) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL is unavailable.");

    this.gl = gl;
    this.getLevel = getLevel;
    this.particleProgram = createProgram(
      gl,
      PARTICLE_VERTEX,
      PARTICLE_FRAGMENT,
      ["aPosition", "aSize", "aSeed", "aKind"],
      ["uTime", "uLevel", "uActivity"],
    );
    this.lineProgram = createProgram(
      gl,
      RING_VERTEX,
      RING_FRAGMENT,
      [
        "aStart",
        "aEnd",
        "aStartSeed",
        "aEndSeed",
        "aAlong",
        "aSide",
        "aAlpha",
        "aHeat",
      ],
      ["uTime", "uLevel", "uActivity", "uResolution"],
    );
    this.coreProgram = createProgram(
      gl,
      CORE_VERTEX,
      CORE_FRAGMENT,
      ["aCore"],
      ["uTime", "uLevel", "uActivity"],
    );

    const particleData = createParticleData();
    this.particles = createParticleGeometry(gl, particleData);
    this.lines = createLineGeometry(gl, particleData);
    this.core = createCoreGeometry(gl);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);
  }

  setPhase(phase: AssistantPhase) {
    this.phase = phase;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTick = 0;
    this.lastDraw = 0;
    this.frame = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.lastTick = 0;
    this.lastDraw = 0;
  }

  destroy() {
    this.stop();
    const gl = this.gl;
    gl.deleteBuffer(this.particles.buffer);
    gl.deleteBuffer(this.lines.buffer);
    gl.deleteBuffer(this.core.buffer);
    gl.deleteProgram(this.particleProgram.program);
    gl.deleteProgram(this.lineProgram.program);
    gl.deleteProgram(this.coreProgram.program);
  }

  private readonly tick = (now: number) => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.tick);

    const frameInterval = isActivePhase(this.phase) ? ACTIVE_FRAME_MS : IDLE_FRAME_MS;
    if (this.lastDraw && now - this.lastDraw < frameInterval) return;

    const delta = this.lastTick ? Math.min((now - this.lastTick) / 1000, 0.1) : 0;
    this.lastTick = now;
    if (this.lastDraw) {
      this.lastDraw += frameInterval;
      if (now - this.lastDraw > frameInterval) this.lastDraw = now;
    } else {
      this.lastDraw = now;
    }
    this.elapsed += delta;

    const targetActivity = activityForPhase(this.phase);
    this.activity += (targetActivity - this.activity) * Math.min(1, delta * 3.4);
    const rawLevel = this.phase === "sleeping" ? 0 : Math.max(0, Math.min(1, this.getLevel()));
    const levelResponse = rawLevel > this.level ? 9 : 4.2;
    this.level += (rawLevel - this.level) * Math.min(1, delta * levelResponse);

    this.resize();
    this.draw();
  };

  private resize() {
    const width = Math.max(1, Math.round(this.canvas.clientWidth));
    const height = Math.max(1, Math.round(this.canvas.clientHeight));
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  private draw() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);

    // A quiet cyan center sits behind the mesh instead of covering it.
    gl.useProgram(this.coreProgram.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.core.buffer);
    bindFloatAttribute(gl, this.coreProgram.attributes.aCore, 1, 4, 0);
    setCommonUniforms(gl, this.coreProgram, this.elapsed, this.level, this.activity);
    gl.drawArrays(gl.POINTS, 0, this.core.count);
    disableAttributes(gl, this.coreProgram);

    gl.useProgram(this.lineProgram.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lines.buffer);
    bindFloatAttribute(gl, this.lineProgram.attributes.aStart, 3, 48, 0);
    bindFloatAttribute(gl, this.lineProgram.attributes.aEnd, 3, 48, 12);
    bindFloatAttribute(gl, this.lineProgram.attributes.aStartSeed, 1, 48, 24);
    bindFloatAttribute(gl, this.lineProgram.attributes.aEndSeed, 1, 48, 28);
    bindFloatAttribute(gl, this.lineProgram.attributes.aAlong, 1, 48, 32);
    bindFloatAttribute(gl, this.lineProgram.attributes.aSide, 1, 48, 36);
    bindFloatAttribute(gl, this.lineProgram.attributes.aAlpha, 1, 48, 40);
    bindFloatAttribute(gl, this.lineProgram.attributes.aHeat, 1, 48, 44);
    setCommonUniforms(gl, this.lineProgram, this.elapsed, this.level, this.activity);
    gl.uniform2f(this.lineProgram.uniforms.uResolution, this.canvas.width, this.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, this.lines.count);
    disableAttributes(gl, this.lineProgram);

    gl.useProgram(this.particleProgram.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particles.buffer);
    bindFloatAttribute(gl, this.particleProgram.attributes.aPosition, 3, 24, 0);
    bindFloatAttribute(gl, this.particleProgram.attributes.aSize, 1, 24, 12);
    bindFloatAttribute(gl, this.particleProgram.attributes.aSeed, 1, 24, 16);
    bindFloatAttribute(gl, this.particleProgram.attributes.aKind, 1, 24, 20);
    setCommonUniforms(gl, this.particleProgram, this.elapsed, this.level, this.activity);
    gl.drawArrays(gl.POINTS, 0, this.particles.count);
    disableAttributes(gl, this.particleProgram);
  }
}
