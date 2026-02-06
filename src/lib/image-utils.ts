/**
 * Validates if a URL is a direct image URL (not a Google redirect or search result)
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  // Check if it's a Google redirect URL
  if (
    url.includes("google.com/url?") ||
    url.includes("google.com/search?") ||
    url.includes("google.com/imgres?")
  ) {
    return false;
  }
  //https://ik.imagekit.io/
  // Check if it has a valid image extension or is from a known image CDN
  const validImagePatterns = [
    /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i,
    /images\.unsplash\.com/,
    /firebasestorage\.googleapis\.com/,
    /cloudinary\.com/,
    /imgur\.com/,
    /ik\.imagekit\.io/,
  ];

  return validImagePatterns.some((pattern) => pattern.test(url));
}

/**
 * Gets a fallback placeholder image URL based on context
 */
export function getFallbackImageUrl(
  context: "dish" | "offer" | "special" | "hero" = "dish",
): string {
  const fallbacks = {
    dish: "https://ik.imagekit.io/4b6bfmrdo/restaurant/586789985_17847308862606961_3110687156587654615_n_h2aAY_Pfzp.jpg",
    offer:
      "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&h=600&fit=crop",
    special:
      "https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=800&h=600&fit=crop",
    hero: "https://images.unsplash.com/photo-1613274554329-70f997f5789f?w=1920&h=1080&fit=crop",
  };

  return fallbacks[context];
}

/**
 * Sanitizes an image URL, returning a valid URL or a fallback
 */
export function sanitizeImageUrl(
  url: string,
  context: "dish" | "offer" | "special" | "hero" = "dish",
): string {
  if (isValidImageUrl(url)) {
    return url;
  }

  console.warn(`Invalid image URL detected: ${url}. Using fallback.`);
  return getFallbackImageUrl(context);
}
