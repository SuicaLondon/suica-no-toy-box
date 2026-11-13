/**
 * Regular expressions for the image files Image Studio accepts. General
 * patterns live in src/utils/regex.ts.
 */

/** A file name Image Studio can read: JPEG, PNG, WebP or HEIC/HEIF. */
export const IMAGE_FILE_NAME = /\.(jpe?g|png|webp|heic|heif)$/i;

/** A MIME type Image Studio can read. */
export const IMAGE_MIME_TYPE = /^image\/(jpeg|png|webp|heic|heif)$/;

/** A HEIC or HEIF file name: browsers cannot decode these themselves. */
export const HEIC_FILE_NAME = /\.(heic|heif)$/i;

/** A HEIC or HEIF MIME type. */
export const HEIC_MIME_TYPE = /image\/hei[cf]/;
