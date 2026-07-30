/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Strapi backend base URL; defaults to https://api.thilo.scouts.ch/ */
  readonly BACKEND_URL?: string;
  /** Set to "true" to include unpublished sections and chapters in the build */
  readonly SHOW_DRAFTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Reading progress helpers BaseLayout hands to inline scripts that cannot
// import modules themselves (see docs/GAMIFICATION.md)
type ThiloProgressApi = Pick<
  typeof import('./utils/progress'),
  'getProgress' | 'isChapterRead' | 'markChapterRead' | 'getSectionReadCount' | 'onProgressChange'
>;

interface Window {
  /** Undefined until BaseLayout's module script runs; it then fires PROGRESS_EVENT */
  thiloProgress?: ThiloProgressApi;
  /** Base path handed from Header's define:vars script to its module script */
  __headerBase?: string;
  /** Aborts the previous Header setup's listeners when it re-runs after a page transition */
  __headerController?: AbortController;
  /** Guards Header's one-time astro:page-load registration */
  __headerDocListeners?: boolean;
}

// Type declarations for vite-plugin-pwa virtual module
declare module 'virtual:pwa-register' {
  export type RegisterSWOptions = {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisteredSW?: (swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  };
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
