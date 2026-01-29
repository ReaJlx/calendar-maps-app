/**
 * Clerk Webhook Handler
 * 
 * Syncs Clerk user events with the database.
 * Requires CLERK_WEBHOOK_SECRET to be configured.
 */

import { headers } from 'next/headers'
import { Webhook } from 'svix'

import { getClerkEnv } from '@/config/env'
import { userService } from '@/services/user'
import type { ClerkWebhookEvent, ClerkWebhookUser } from '@/types/webhooks'

function getDisplayName(user: ClerkWebhookUser): string | null {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || null
}

export async function POST(request: Request) {
  try {
    const env = getClerkEnv()
    
    if (!env.CLERK_WEBHOOK_SECRET) {
      return new Response('Webhook secret not configured', { status: 500 })
    }

    const payload = await request.text()
    const headerList = await headers()

    const svixId = headerList.get('svix-id')
    const svixTimestamp = headerList.get('svix-timestamp')
    const svixSignature = headerList.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response('Missing svix headers', { status: 400 })
    }

    const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET)
    let event: ClerkWebhookEvent

    try {
      event = webhook.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent
    } catch (error) {
      console.error('Clerk webhook verification failed', error)
      return new Response('Invalid webhook signature', { status: 400 })
    }

    const clerkUser = event.data

    // Handle user deletion
    if (event.type === 'user.deleted') {
      if (clerkUser?.id) {
        await userService.deleteByClerkId(clerkUser.id)
      }
      return Response.json({ ok: true })
    }

    // Handle user creation/update
    const email = clerkUser.email_addresses?.[0]?.email_address
    if (!email) {
      return new Response('Missing email address', { status: 400 })
    }

    await userService.syncFromClerk({
      clerkId: clerkUser.id,
      email,
      name: getDisplayName(clerkUser),
      imageUrl: clerkUser.image_url ?? null,
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Webhook processing failed:', error)
    return new Response(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    )
  }
}
