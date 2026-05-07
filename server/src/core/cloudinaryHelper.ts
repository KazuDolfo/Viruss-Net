/**
 * Helper to automatically optimize Cloudinary URLs.
 * Injects transformation parameters for auto format, auto quality and specific width.
 */
export const optimizeCloudinaryUrl = (url: string, width: number = 300): string => {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Check if it already has transformations
  if (url.includes('/upload/') && !url.includes('f_auto')) {
    const transformation = `f_auto,q_auto,w_${width}`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  return url;
};
