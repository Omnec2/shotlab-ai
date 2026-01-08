/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_HUGGING_FACE_TOKEN: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
