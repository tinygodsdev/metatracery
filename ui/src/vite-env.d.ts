/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public site origin, no trailing slash (e.g. https://grammar.tinygods.dev) */
  readonly VITE_PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
