import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { postgres_db } from '@lieferschein-hitscher/db-drizzle'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(postgres_db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: !!resend,
  },
  emailVerification: resend
    ? {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@lieferschein-hitscher.de',
            to: user.email,
            subject: 'Bestätigen Sie Ihre E-Mail-Adresse',
            html: `<p>Klicken Sie auf den folgenden Link, um Ihre E-Mail-Adresse zu bestätigen:</p><p><a href="${url}">${url}</a></p>`,
          })
        },
      }
    : undefined,
  plugins: [
    passkey({
      rpID: process.env.PASSKEY_RP_ID || 'localhost',
      rpName: 'Lieferschein Hitscher',
      origin: process.env.PASSKEY_ORIGIN || 'http://localhost:3000',
    }),
    tanstackStartCookies(),
  ],
})
