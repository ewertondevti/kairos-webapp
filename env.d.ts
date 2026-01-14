/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_KEY: string;
    readonly NEXT_PUBLIC_AUTH_DOMAIN: string;
    readonly NEXT_PUBLIC_PROJECT_ID: string;
    readonly NEXT_PUBLIC_STORAGE_BUCKET: string;
    readonly NEXT_PUBLIC_DEFAULT_USER_EMAIL?: string;
    readonly NEXT_PUBLIC_DEFAULT_USER_TOKEN?: string;
    readonly NEXT_PUBLIC_FACEBOOK_URL?: string;
    readonly NEXT_PUBLIC_INSTAGRAM_URL?: string;
    readonly NEXT_PUBLIC_PTCP_APP_ID?: string;
  }
}
