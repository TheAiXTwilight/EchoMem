export const PARTICLE_VERTEX = `
precision mediump float;
attribute vec3 aPosition;
attribute float aSize;
attribute float aSeed;
attribute float aKind;
uniform float uTime;
uniform float uLevel;
uniform float uActivity;
varying float vAlpha;
varying float vKind;
varying float vDepth;
varying float vSpark;

mat3 ry(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c);
}

void main() {
  float rotation = uTime * (0.055 + uActivity * 0.075);
  vec3 p = ry(rotation) * aPosition;

  float voiceWave = sin(aSeed * 5.7 + uTime * 5.2);
  float response = uLevel * (0.018 + voiceWave * 0.008);
  p *= 1.0 + response;

  // Orthographic projection keeps the upright globe perfectly circular and
  // eliminates the tilted or perspective-slanted appearance.
  gl_Position = vec4(p.xy * 0.94, 0.0, 1.0);

  float depth = clamp(p.z / 0.83 * 0.5 + 0.5, 0.0, 1.0);
  float flicker = 0.86 + 0.14 * sin(uTime * (1.15 + mod(aSeed, 1.8)) + aSeed * 3.1);
  vAlpha = mix(0.3, 1.0, depth) * flicker * (0.9 + uActivity * 0.1);
  vKind = aKind;
  vDepth = depth;
  vSpark = 0.5 + 0.5 * sin(aSeed * 4.3 + uTime * 1.8);
  gl_PointSize =
    (aSize * mix(1.0, 1.48, aKind) + uLevel * 1.6) * mix(0.78, 1.18, depth);
}`;

export const PARTICLE_FRAGMENT = `
precision mediump float;
varying float vAlpha;
varying float vKind;
varying float vDepth;
varying float vSpark;

void main() {
  vec2 p = gl_PointCoord - 0.5;
  float distanceFromCenter = length(p);
  float halo = 1.0 - smoothstep(0.16, 0.5, distanceFromCenter);
  float core = 1.0 - smoothstep(0.04, 0.2, distanceFromCenter);
  float alpha = core + halo * mix(0.28, 0.52, vKind);
  if (alpha < 0.018) discard;

  vec3 electricBlue = vec3(0.015, 0.32, 0.92);
  vec3 cyan = vec3(0.08, 0.82, 1.0);
  vec3 iceWhite = vec3(0.82, 0.98, 1.0);
  vec3 surfaceColor = mix(electricBlue, cyan, vDepth);
  float hotAmount = clamp(vKind * 0.65 + core * 0.42 + vSpark * 0.12, 0.0, 1.0);
  vec3 color = mix(surfaceColor, iceWhite, hotAmount);

  gl_FragColor = vec4(color, alpha * vAlpha);
}`;

export const RING_VERTEX = `
precision mediump float;
attribute vec3 aStart;
attribute vec3 aEnd;
attribute float aStartSeed;
attribute float aEndSeed;
attribute float aAlong;
attribute float aSide;
attribute float aAlpha;
attribute float aHeat;
uniform float uTime;
uniform float uLevel;
uniform float uActivity;
uniform vec2 uResolution;
varying float vAlpha;
varying float vHeat;
varying float vSide;
varying float vDepth;
varying float vPulse;

mat3 ry(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c);
}

vec3 movePoint(vec3 source, float seed) {
  float rotation = uTime * (0.055 + uActivity * 0.075);
  vec3 p = ry(rotation) * source;
  float voiceWave = sin(seed * 5.7 + uTime * 5.2);
  p *= 1.0 + uLevel * (0.018 + voiceWave * 0.008);
  return p;
}

vec2 projectPoint(vec3 p) {
  return p.xy * 0.94;
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  vec3 movedStart = movePoint(aStart, aStartSeed);
  vec3 movedEnd = movePoint(aEnd, aEndSeed);
  vec2 clipStart = projectPoint(movedStart);
  vec2 clipEnd = projectPoint(movedEnd);
  vec2 pixelStart = (clipStart * 0.5 + 0.5) * resolution;
  vec2 pixelEnd = (clipEnd * 0.5 + 0.5) * resolution;
  vec2 delta = pixelEnd - pixelStart;
  float segmentLength = max(length(delta), 0.001);
  vec2 normal = vec2(-delta.y, delta.x) / segmentLength;

  float averageDepth = mix(movedStart.z, movedEnd.z, aAlong);
  float normalizedDepth = clamp(averageDepth / 0.83 * 0.5 + 0.5, 0.0, 1.0);
  float halfWidth = 0.67 + normalizedDepth * 0.24 + uActivity * 0.08 + uLevel * 0.24;
  vec2 pixelPosition = mix(pixelStart, pixelEnd, aAlong) + normal * aSide * halfWidth;
  vec2 clipPosition = (pixelPosition / resolution) * 2.0 - 1.0;

  gl_Position = vec4(clipPosition, 0.0, 1.0);
  vAlpha = aAlpha * (0.94 + uActivity * 0.08 + uLevel * 0.18);
  vHeat = aHeat;
  vSide = aSide;
  vDepth = normalizedDepth;
  vPulse = 0.5 + 0.5 * sin(uTime * 1.7 + mix(aStartSeed, aEndSeed, aAlong));
}`;

export const RING_FRAGMENT = `
precision mediump float;
varying float vAlpha;
varying float vHeat;
varying float vSide;
varying float vDepth;
varying float vPulse;

void main() {
  float edge = 1.0 - smoothstep(0.62, 1.0, abs(vSide));
  if (edge < 0.018) discard;

  vec3 deepBlue = vec3(0.015, 0.22, 0.82);
  vec3 electricCyan = vec3(0.035, 0.78, 1.0);
  vec3 whiteCyan = vec3(0.72, 0.97, 1.0);
  vec3 depthColor = mix(deepBlue, electricCyan, vDepth);
  float whiteAmount = clamp((vHeat - 0.58) * 0.66 + vDepth * 0.22 + vPulse * 0.08, 0.0, 0.62);
  vec3 color = mix(depthColor, whiteCyan, whiteAmount);
  float depthAlpha = mix(0.26, 1.0, vDepth);
  float glow = 0.76 + edge * 0.24;

  gl_FragColor = vec4(color, vAlpha * depthAlpha * edge * glow);
}`;

export const CORE_VERTEX = `
precision mediump float;
attribute float aCore;
uniform float uTime;
uniform float uLevel;
uniform float uActivity;
varying float vPulse;
void main() {
  float pulse = 0.5 + 0.5 * sin(uTime * (1.55 + uActivity * 0.75));
  vPulse = pulse;
  gl_Position = vec4(aCore * 0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 25.0 + pulse * 3.0 + uLevel * 10.0;
}`;

export const CORE_FRAGMENT = `
precision mediump float;
uniform float uLevel;
varying float vPulse;
void main() {
  float distanceFromCenter = length(gl_PointCoord - 0.5);
  float hot = 1.0 - smoothstep(0.0, 0.12, distanceFromCenter);
  float body = 1.0 - smoothstep(0.07, 0.27, distanceFromCenter);
  float halo = 1.0 - smoothstep(0.13, 0.5, distanceFromCenter);
  vec3 cyan = vec3(0.02, 0.62, 1.0);
  vec3 iceWhite = vec3(0.78, 0.98, 1.0);
  vec3 color = mix(cyan, iceWhite, hot);
  float alpha = hot * 0.7 + body * 0.3 + halo * (0.055 + vPulse * 0.025 + uLevel * 0.08);
  if (alpha < 0.012) discard;
  gl_FragColor = vec4(color, min(alpha, 0.86));
}`;
