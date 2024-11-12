/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_STORAGE_BUCKET: string;
  readonly VITE_DEFAULT_USER_EMAIL: string;
  readonly VITE_DEFAULT_USER_TOKEN: string;
  readonly VITE_FACEBOOK_URL: string;
  readonly VITE_INSTAGRAM_URL: string;
  readonly VITE_PTCP_APP_ID: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
