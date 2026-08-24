import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { JarvisOrb } from "./components/JarvisOrb";

import type {
  AssistantPhase,
  DisplayMode,
} from "./types/assistant";

type ServerEvent = {
  type?: string;
  state?: AssistantPhase;
  phase?: AssistantPhase;

  command?:
    | "minimize"
    | "restore"
    | "hide";

  level?: number;
};

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

const VALID_PHASES:
  AssistantPhase[] = [
    "sleeping",
    "idle",
    "listening",
    "thinking",
    "speaking",
    "error",
  ];

export default function App() {
  const runningInTauri =
    Boolean(
      window.__TAURI_INTERNALS__,
    );

  const isFrontendPreview =
    import.meta.env.DEV;

  const [phase, setPhase] =
    useState<AssistantPhase>(
      "idle",
    );

  /*
   * Development displays the orb for
   * testing. A production build starts
   * hidden until the wake event.
   */
  const [mode, setMode] =
    useState<DisplayMode>(
      isFrontendPreview
        ? "orb"
        : "hidden",
    );

  const audioLevelRef =
    useRef<number | null>(
      null,
    );

  const previewTimerRef =
    useRef<number | null>(
      null,
    );

  const clearPreviewTimer =
    useCallback(() => {
      if (
        previewTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          previewTimerRef.current,
        );

        previewTimerRef.current =
          null;
      }
    }, []);

  const showOrb =
    useCallback(
      (
        nextPhase:
          AssistantPhase = "idle",
      ) => {
        clearPreviewTimer();
        setMode("orb");
        setPhase(nextPhase);
      },
      [clearPreviewTimer],
    );

  const handleServerEvent =
    useCallback(
      (event: ServerEvent) => {
        if (
          event.type === "wake" ||
          event.type ===
            "wake_detected"
        ) {
          showOrb("listening");
          return;
        }

        if (
          event.type ===
          "ui_command"
        ) {
          if (
            event.command ===
            "minimize"
          ) {
            setMode("edge");
          }

          if (
            event.command ===
            "restore"
          ) {
            setMode("orb");
          }

          if (
            event.command ===
            "hide"
          ) {
            setMode("hidden");
          }

          return;
        }

        if (
          event.type ===
            "audio_level" &&
          typeof event.level ===
            "number"
        ) {
          audioLevelRef.current =
            Math.max(
              0,
              Math.min(
                1,
                event.level,
              ),
            );

          return;
        }

        const nextPhase =
          event.phase ??
          event.state;

        if (
          nextPhase &&
          VALID_PHASES.includes(
            nextPhase,
          )
        ) {
          if (
            nextPhase ===
            "listening"
          ) {
            setMode(
              (current) =>
                current ===
                "hidden"
                  ? "orb"
                  : current,
            );
          }

          if (
            nextPhase !==
            "speaking"
          ) {
            audioLevelRef.current =
              null;
          }

          setPhase(nextPhase);
        }
      },
      [showOrb],
    );

  useEffect(() => {
    const receiveOverlayEvent =
      (event: Event) => {
        const customEvent =
          event as CustomEvent<
            ServerEvent
          >;

        handleServerEvent(
          customEvent.detail,
        );
      };

    window.addEventListener(
      "echomem:overlay",
      receiveOverlayEvent,
    );

    return () => {
      window.removeEventListener(
        "echomem:overlay",
        receiveOverlayEvent,
      );
    };
  }, [handleServerEvent]);

  useEffect(() => {
    if (
      !runningInTauri &&
      import.meta.env
        .VITE_CONNECT_BACKEND !==
        "true"
    ) {
      return;
    }

    let stopped = false;

    let socket:
      WebSocket | null = null;

    let reconnectTimer = 0;

    const connect = () => {
      const url =
        import.meta.env
          .VITE_ASSISTANT_WS ??
        "ws://127.0.0.1:8000/listen";

      socket =
        new WebSocket(url);

      socket.onmessage =
        (message) => {
          try {
            const serverEvent =
              JSON.parse(
                message.data,
              ) as ServerEvent;

            handleServerEvent(
              serverEvent,
            );
          } catch {
            /*
             * Malformed messages must
             * never interrupt the
             * desktop overlay.
             */
          }
        };

      socket.onclose = () => {
        if (!stopped) {
          reconnectTimer =
            window.setTimeout(
              connect,
              2500,
            );
        }
      };
    };

    connect();

    return () => {
      stopped = true;

      window.clearTimeout(
        reconnectTimer,
      );

      socket?.close();
    };
  }, [
    handleServerEvent,
    runningInTauri,
  ]);

  useEffect(() => {
    if (runningInTauri) {
      return;
    }

    const previewKeyboard =
      (event: KeyboardEvent) => {
        const key =
          event.key.toLowerCase();

        if (key === "w") {
          showOrb("listening");
        } else if (
          key === "s"
        ) {
          showOrb("speaking");

          previewTimerRef.current =
            window.setTimeout(
              () => {
                setPhase("idle");
              },
              4200,
            );
        } else if (
          key === "t"
        ) {
          showOrb("thinking");
        } else if (
          key === "m"
        ) {
          clearPreviewTimer();
          setMode("edge");
        } else if (
          key === "r"
        ) {
          clearPreviewTimer();
          setMode("orb");
          setPhase("idle");
        } else if (
          key === "h" ||
          event.key === "Escape"
        ) {
          clearPreviewTimer();
          setMode("hidden");
        }
      };

    window.addEventListener(
      "keydown",
      previewKeyboard,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        previewKeyboard,
      );
    };
  }, [
    clearPreviewTimer,
    runningInTauri,
    showOrb,
  ]);

  useEffect(
    () => () => {
      clearPreviewTimer();
    },
    [clearPreviewTimer],
  );

  return (
    <main className="overlay-root">
      <JarvisOrb
        phase={phase}
        mode={mode}
        externalAudioLevelRef={
          audioLevelRef
        }
      />

      <span
        className="sr-only"
        aria-live="polite"
      >
        Assistant is {phase}
      </span>
    </main>
  );
}