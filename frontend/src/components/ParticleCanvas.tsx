import { useEffect, useRef, type MutableRefObject } from "react";
import type { AssistantPhase, DisplayMode } from "../types/assistant";
import { ReactorRenderer } from "./webgl/reactorRenderer";

type ParticleCanvasProps = {
  phase: AssistantPhase;
  mode: DisplayMode;
  levelRef: MutableRefObject<number>;
};

/** React lifecycle wrapper for the bounded native WebGL reactor. */
export function ParticleCanvas({ phase, mode, levelRef }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<ReactorRenderer | null>(null);
  const sourceLevelRef = useRef(levelRef);
  sourceLevelRef.current = levelRef;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      rendererRef.current = new ReactorRenderer(canvas, () => sourceLevelRef.current.current);
    } catch (error) {
      console.warn("EchoMem reactor could not start WebGL.", error);
    }

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setPhase(phase);
  }, [phase]);

  useEffect(() => {
    const syncPlayback = () => {
      const shouldRun = mode === "orb" && !document.hidden;
      if (shouldRun) rendererRef.current?.start();
      else rendererRef.current?.stop();
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
      rendererRef.current?.stop();
    };
  }, [mode]);

  return (
    <div
      className={`reactor-webgl reactor-webgl-${phase} reactor-webgl-mode-${mode}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="reactor-webgl-canvas" />
    </div>
  );
}
