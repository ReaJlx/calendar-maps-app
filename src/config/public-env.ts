/**
 * Public Environment Configuration
 * 
 * These helpers are safe to use on the client side.
 * Only NEXT_PUBLIC_* variables should be accessed here.
 */

/**
 * Check if Clerk publishable key is configured (client-safe)
 */
export function isClerkPublishableConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
}

/**
 * Check if Cloudinary cloud name is configured (client-safe)
 */
export function isCloudinaryPublicConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
}
