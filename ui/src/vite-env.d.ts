/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API, e.g. https://api.example.com (no trailing slash). */
  readonly VITE_API_URL?: string;
  /** When "true", the app forces demo mode at build time (no backend required). */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
