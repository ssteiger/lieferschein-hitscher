-- Better Auth core tables + passkey plugin
-- Schema based on better-auth v1.2+ and @better-auth/passkey

-- User table
CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL DEFAULT false,
    "image" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session" ("userId");

-- Account table
CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp,
    "refreshTokenExpiresAt" timestamp,
    "scope" text,
    "password" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account" ("userId");

-- Verification table
CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification" ("identifier");

-- Passkey table (from @better-auth/passkey plugin)
CREATE TABLE IF NOT EXISTS "passkey" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text,
    "publicKey" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "credentialID" text NOT NULL,
    "counter" integer NOT NULL,
    "deviceType" text NOT NULL,
    "backedUp" boolean NOT NULL,
    "transports" text,
    "createdAt" timestamp,
    "aaguid" text
);

CREATE INDEX IF NOT EXISTS "idx_passkey_userId" ON "passkey" ("userId");
CREATE INDEX IF NOT EXISTS "idx_passkey_credentialID" ON "passkey" ("credentialID");
