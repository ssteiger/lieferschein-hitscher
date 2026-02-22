import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { postgres_db } from '@lieferschein-hitscher/db-drizzle'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(postgres_db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    passkey({
      rpID: process.env.PASSKEY_RP_ID || 'localhost',
      rpName: 'Lieferschein Hitscher',
      origin: process.env.PASSKEY_ORIGIN || 'http://localhost:3000',
    }),
    tanstackStartCookies(),
  ],
})
