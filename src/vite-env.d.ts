/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HELP_CENTER_URL?: string;
  readonly VITE_HELP_URL?: string;
  // Add additional VITE_ vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

