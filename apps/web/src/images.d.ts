// The types for imported images (`import clip from './404.webp'`). Next writes
// the same reference into next-env.d.ts, which is generated and not committed,
// so a clean checkout (CI) would not know an image import without this.
/// <reference types="next/image-types/global" />
