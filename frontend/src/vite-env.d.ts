/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONNECT_BACKEND?: string;
  readonly VITE_ASSISTANT_WS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
