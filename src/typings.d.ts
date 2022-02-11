declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

declare module 'mockjs';
declare module 'nano-memoize';
declare module '@woulsl/request';

interface Window {
  reloadAuthorized: () => void;
}

declare const ENV_DEBUG: string | false;
declare const ENV_NAME: 'dev' | 'fat' | 'uat' | 'pro' | false;
declare const CDN_DOMAIN: string;
declare const CDN_PREFIX: string;
