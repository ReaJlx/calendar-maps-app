/**
 * Webhook Types
 * Types for Clerk webhook events
 */

export interface ClerkWebhookUser {
  id: string
  email_addresses?: Array<{ email_address: string }>
  first_name?: string | null
  last_name?: string | null
  image_url?: string | null
}

export type ClerkWebhookEventType = 
  | 'user.created' 
  | 'user.updated' 
  | 'user.deleted'

export interface ClerkWebhookEvent {
  type: ClerkWebhookEventType
  data: ClerkWebhookUser
}
