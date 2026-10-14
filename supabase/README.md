# DurablFi Supabase setup

Apply `migrations/001_durablfi_publisher.sql` in the Supabase SQL Editor or with a SQL-capable deployment credential. The current sandbox key can reach Auth settings but does not have database-admin privileges, so the migration is prepared and versioned here rather than applied through the public REST endpoint.

## Auth settings

Enable email/password authentication and email confirmations. Disable public signup. Enable password reset with generic responses. Configure Cloudflare Turnstile for sign-in and password reset, and use custom SMTP before production. Keep the documented Auth rate limits: 30 sign-in/recovery requests per 5 minutes per IP, 60 seconds between OTP/verification resends, 30 verification requests per 5 minutes per IP, 150 token requests per 5 minutes per IP, and 15 MFA challenge/verify requests per minute per IP. Keep a 1-hour JWT expiry and the 10-second refresh-token reuse interval.

Basic TOTP MFA is available on the Free tier and should be enabled for the single Publisher account before production launch.

## Explicit Free-tier limitation

Supabase Free does not provide time-boxed sessions, inactivity timeout, or single-session enforcement. These are intentionally **not** simulated in application code. After upgrading to Pro, enable:

- Maximum session lifetime: 12 hours
- Inactivity timeout: 30 minutes
- Single session per user: enabled

The corresponding code comments are in `client/src/lib/supabase.ts` and the SQL migration. The environment variable reference for a local checkout is in `docs/ENVIRONMENT.md`. The database RLS model is independent of these session controls and remains enforced on Free.

## First admin account

Create and email-confirm the founder account in Supabase Auth, then insert its UUID into `public.admin_users` using the SQL Editor. Do not expose a public signup route. The Publisher UI relies on `public.is_admin()` and RLS; frontend visibility is not the security boundary.
