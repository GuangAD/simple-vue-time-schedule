/// <reference types="vite/client" />

declare module 'fastest-json-copy' {
  export function copy<T>(obj: T): T
}
