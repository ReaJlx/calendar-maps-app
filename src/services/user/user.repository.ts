import { eq } from 'drizzle-orm'

import type { Database } from '@/lib/db'
import { users } from '@/lib/db/schema'
import type { NewUser, User } from '@/lib/db/schema/users'

export interface UserRepository {
  findByClerkId(clerkId: string): Promise<User | null>
  create(data: NewUser): Promise<User>
  updateByClerkId(clerkId: string, data: Partial<NewUser>): Promise<User | null>
  deleteByClerkId(clerkId: string): Promise<void>
}

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findByClerkId(clerkId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1)

    return result[0] ?? null
  }

  async create(data: NewUser): Promise<User> {
    const result = await this.db.insert(users).values(data).returning()
    return result[0]
  }

  async updateByClerkId(
    clerkId: string,
    data: Partial<NewUser>
  ): Promise<User | null> {
    const result = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkId))
      .returning()

    return result[0] ?? null
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.db.delete(users).where(eq(users.clerkId, clerkId))
  }
}
