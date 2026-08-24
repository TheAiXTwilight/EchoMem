import { useEffect, useRef, type MutableRefObject } from "react";
import { ParticleCanvas } from "./ParticleCanvas";
import type { AssistantPhase, DisplayMode } from "../types/assistant";

type JarvisOrbProps = {
  phase: AssistantPhase;
  mode: DisplayMode;
  externalAudioLevelRef?: MutableRefObject<number | null>;
};

type FrontHudTick = {
  angle: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hot: boolean;
  opacity: number;
};

function makeFrontHudTicks(count: number, radius: number, seed: number): FrontHudTick[] {
  return Array.from({ length: count }, (_, index) => {
    const variation = (Math.sin((index + seed) * 12.31) + 1) * 0.5;
    const length = 0.55 + variation * 1.25;
    const thickness = 0.26 + ((index * 7 + seed) % 5) * 0.055;

    return {
      angle: (index * 360) / count,
      x: 50 - length / 2,
      y: 50 - radius - thickness / 2,
      width: length,
      height: thickness,
      hot: index % 11 === 0,
      opacity: 0.42 + ((index * 13 + seed) % 9) * 0.065,
    };
  });
}

const OUTER_FRONT_TICKS = makeFrontHudTicks(84, 46.5, 7);
const INNER_FRONT_TICKS = makeFrontHudTicks(60, 37.5, 19);

export function JarvisOrb({ phase, mode, externalAudioLevelRef }: JarvisOrbProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const levelRef = useRef(0);
  const phaseRef = useRef(phase);

  phaseRef.current = phase;

  useEffect(() => {
    let frame = 0;
    let current = 0;
    let lastUpdate = 0;

    const animateLevel = (now: number) => {
      if (now - lastUpdate < 1000 / 30) {
        frame = requestAnimationFrame(animateLevel);
        return;
      }
      lastUpdate = now;

      const activePhase = phaseRef.current;
      const time = now / 1000;
      let target = 0.025;

      if (activePhase === "listening") {
        target = 0.13 + Math.max(0, Math.sin(time * 4.4)) * 0.13;
      } else if (activePhase === "thinking") {
        target = 0.08 + (Math.sin(time * 2.6) + 1) * 0.045;
      } else if (activePhase === "speaking") {
        const externalLevel = externalAudioLevelRef?.current;
        if (externalLevel !== null && externalLevel !== undefined) {
          target = externalLevel;
        } else {
          const simulatedVoice =
            Math.abs(Math.sin(time * 7.1)) * 0.28 +
            Math.abs(Math.sin(time * 12.7 + 0.8)) * 0.2 +
            Math.abs(Math.sin(time * 19.3 + 2.1)) * 0.13;
          target = Math.min(0.92, 0.16 + simulatedVoice);
        }
      } else if (activePhase === "error") {
        target = (Math.sin(time * 11) + 1) * 0.12;
      } else if (activePhase === "sleeping") {
        target = 0;
      } else {
        target = 0.025 + (Math.sin(time * 1.25) + 1) * 0.014;
      }

      const response = target > current ? 0.19 : 0.07;
      current += (target - current) * response;
      levelRef.current = current;

      const shell = shellRef.current;
      if (shell) {
        shell.style.setProperty("--audio-level", current.toFixed(3));
        shell.style.setProperty("--orb-scale", (1 + current * 0.045).toFixed(4));
      }

      frame = requestAnimationFrame(animateLevel);
    };

    frame = requestAnimationFrame(animateLevel);
    return () => cancelAnimationFrame(frame);
  }, [externalAudioLevelRef]);

  return (
    <div
      ref={shellRef}
      className={`assistant-shell mode-${mode} phase-${phase}`}
      aria-hidden="true"
    >
      <div className="edge-haze" />
      <div className="edge-corner edge-corner-tl" />
      <div className="edge-corner edge-corner-tr" />
      <div className="edge-corner edge-corner-bl" />
      <div className="edge-corner edge-corner-br" />

      <div className="orb-interior">
        <div className="front-hud-layer">
          <svg
            className="front-hud-svg"
            viewBox="0 0 100 100"
            focusable="false"
            aria-hidden="true"
          >
            <g className="front-hud-rotor front-hud-outer-ticks">
              {OUTER_FRONT_TICKS.map((tick, index) => (
                <rect
                  key={`outer-${index}`}
                  className={tick.hot ? "front-hud-tick front-hud-tick-hot" : "front-hud-tick"}
                  x={tick.x}
                  y={tick.y}
                  width={tick.width}
                  height={tick.height}
                  rx="0.12"
                  opacity={tick.opacity}
                  transform={`rotate(${tick.angle} 50 50)`}
                />
              ))}
            </g>

            <g className="front-hud-rotor front-hud-outer-rails">
              <circle className="front-hud-rail-glow" cx="50" cy="50" r="45.2" pathLength="360" strokeDasharray="91 8 46 5 74 12 39 7 52 26" />
              <circle className="front-hud-rail" cx="50" cy="50" r="45.2" pathLength="360" strokeDasharray="91 8 46 5 74 12 39 7 52 26" />
              <circle className="front-hud-track front-hud-track-soft" cx="50" cy="50" r="44.5" pathLength="360" strokeDasharray="2 3" />
            </g>

            <g className="front-hud-rotor front-hud-primary-arcs">
              <circle className="front-hud-bloom" cx="50" cy="50" r="43.1" pathLength="360" strokeDasharray="72 18 39 12 88 24 54 53" />
              <circle className="front-hud-heavy" cx="50" cy="50" r="43.1" pathLength="360" strokeDasharray="72 18 39 12 88 24 54 53" />
              <circle className="front-hud-medium-glow" cx="50" cy="50" r="41.4" pathLength="360" strokeDasharray="47 9 76 13 34 7 91 19 38 26" />
              <circle className="front-hud-medium" cx="50" cy="50" r="41.4" pathLength="360" strokeDasharray="47 9 76 13 34 7 91 19 38 26" />
            </g>

            <g className="front-hud-rotor front-hud-mid-arcs">
              <circle className="front-hud-band-glow" cx="50" cy="50" r="39.9" pathLength="360" strokeDasharray="31 7 67 12 25 5 84 16 48 65" />
              <circle className="front-hud-band" cx="50" cy="50" r="39.9" pathLength="360" strokeDasharray="31 7 67 12 25 5 84 16 48 65" />
              <circle className="front-hud-track front-hud-track-bright" cx="50" cy="50" r="38.7" pathLength="360" strokeDasharray="113 7 58 5 87 9 33 48" />
            </g>

            <g className="front-hud-rotor front-hud-inner-ticks">
              {INNER_FRONT_TICKS.map((tick, index) => (
                <rect
                  key={`inner-${index}`}
                  className={tick.hot ? "front-hud-tick front-hud-tick-hot" : "front-hud-tick front-hud-tick-deep"}
                  x={tick.x}
                  y={tick.y}
                  width={tick.width}
                  height={tick.height}
                  rx="0.1"
                  opacity={tick.opacity}
                  transform={`rotate(${tick.angle} 50 50)`}
                />
              ))}
            </g>

            <g className="front-hud-rotor front-hud-track-two">
              <circle className="front-hud-aperture-glow" cx="50" cy="50" r="36.2" pathLength="360" strokeDasharray="69 6 37 4 89 8 52 5 46 44" />
              <circle className="front-hud-aperture" cx="50" cy="50" r="36.2" pathLength="360" strokeDasharray="69 6 37 4 89 8 52 5 46 44" />
              <circle className="front-hud-track front-hud-track-bright" cx="50" cy="50" r="35.1" pathLength="360" strokeDasharray="124 6 71 5 43 7 68 36" />
            </g>

            <g className="front-hud-rotor front-hud-inner-scan">
              <circle className="front-hud-inner-glow" cx="50" cy="50" r="34" pathLength="360" strokeDasharray="56 5 29 4 78 7 41 5 63 72" />
              <circle className="front-hud-inner-rim" cx="50" cy="50" r="34" pathLength="360" strokeDasharray="56 5 29 4 78 7 41 5 63 72" />
              <circle className="front-hud-track front-hud-track-soft" cx="50" cy="50" r="33.2" pathLength="360" strokeDasharray="21 5 46 8 27 4 63 9 34 143" />
            </g>

            <g className="front-hud-rotor front-hud-node-ring">
              <circle className="front-hud-node front-hud-node-hot" cx="50" cy="14.3" r="0.72" />
              <circle className="front-hud-node" cx="80.3" cy="31" r="0.48" />
              <circle className="front-hud-node front-hud-node-hot" cx="85.1" cy="55.5" r="0.58" />
              <rect className="front-hud-node" x="76.1" y="74.5" width="1.5" height="1.5" rx="0.2" transform="rotate(43 76.85 75.25)" />
              <circle className="front-hud-node" cx="44.5" cy="85" r="0.46" />
              <rect className="front-hud-node front-hud-node-hot" x="19.8" y="68.7" width="1.7" height="1.1" rx="0.18" transform="rotate(-48 20.65 69.25)" />
              <circle className="front-hud-node" cx="15.2" cy="43.6" r="0.52" />
              <circle className="front-hud-node front-hud-node-hot" cx="29.3" cy="21" r="0.62" />
            </g>
          </svg>
        </div>

        <div className="speech-wave speech-wave-one" />
        <div className="speech-wave speech-wave-two" />
        <div className="speech-wave speech-wave-three" />

        <div className="particle-viewport">
          <ParticleCanvas phase={phase} mode={mode} levelRef={levelRef} />
        </div>
      </div>
    </div>
  );
}
