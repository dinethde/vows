import { pgEnum } from 'drizzle-orm/pg-core';

export const albumStatus = pgEnum('album_status', ['draft', 'published', 'archived']);
export const photoStatus = pgEnum('photo_status', ['pending', 'processing', 'ready', 'failed']);
/** `jpeg` is the 1200 × 630 share card. Chat apps do not read AVIF or WebP. */
export const imageFormat = pgEnum('image_format', ['avif', 'webp', 'jpeg']);
export const enquiryStatus = pgEnum('enquiry_status', ['new', 'read', 'replied', 'archived']);
