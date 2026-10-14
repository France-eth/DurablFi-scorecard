# Environment reference

Create these values in your local shell, a private `.env` file, or your deployment provider. Do not commit the values.

## Public client variables

These are exposed to the browser by Vite and must contain only public configuration:

| Variable | Required | Purpose |
|---|---:|---|
| `VITE_SUPABASE_URL` | Yes for Publisher/public Supabase data | Supabase project URL, for example `https://YOUR_PROJECT_REF.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes for Publisher/public Supabase data | Supabase publishable/anon key; never use a service-role key here |
| `VITE_GA_MEASUREMENT_ID` | Optional | Google Analytics 4 measurement ID, loaded only after consent |
| `VITE_OAUTH_PORTAL_URL` | Optional depending on auth deployment | OAuth portal URL used by the scaffold login flow |
| `VITE_APP_ID` | Optional depending on auth deployment | OAuth application identifier |
| `VITE_FRONTEND_FORGE_API_URL` | Optional | Manus runtime frontend API URL if retained in the target environment |
| `VITE_FRONTEND_FORGE_API_KEY` | Optional | Manus runtime frontend key if retained; do not reuse for Supabase |

## Server variables

Keep these server-side only:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | HTTP port; defaults according to the host/runtime |
| `DATABASE_URL` | Template database connection if server-side Drizzle routes are enabled |
| `JWT_SECRET` | Session cookie signing secret for the scaffold auth layer |
| `OAUTH_SERVER_URL` | OAuth server base URL |
| `OWNER_OPEN_ID` | Scaffold owner identity |
| `OWNER_NAME` | Scaffold owner display name |
| `BUILT_IN_FORGE_API_URL` | Manus server-side runtime API URL, if retained |
| `BUILT_IN_FORGE_API_KEY` | Manus server-side runtime key, if retained |

## Verification-only variables

These are used only by tests that validate a real Supabase project. They are not required for the public UI build:

| Variable | Purpose |
|---|---|
| `SUPABASE_PROJECT_REF` | Supabase project reference used by the Management API test; if omitted, the test derives it from `VITE_SUPABASE_URL` |
| `SUPABASE_ACCESS_TOKEN_REPLACEMENT` | Replacement Supabase Management API token used only by `server/credential-validation.test.ts` |
| `DURABLFI_FOUNDER_AUTH_EMAIL` | Founder test account email |
| `DURABLFI_FOUNDER_AUTH_PASSWORD` | Founder test account password |
| `DURABLFI_NONADMIN_AUTH_EMAIL` | Non-admin test account email |
| `DURABLFI_NONADMIN_AUTH_PASSWORD` | Non-admin test account password |
| `SUPABASE_RUN_LIVE_TESTS` | Set to `1` to opt into the live Supabase integration checks |

Never paste any of these values into source code or public issue trackers. The management token and both passwords are especially sensitive.
