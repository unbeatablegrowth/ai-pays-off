# FutureMakers Free Guide Hub setup

The website code is configured for Supabase project `zuqmokdsvbwaolqkwask`.

## 1. Create the database objects

In the Supabase dashboard, open **SQL Editor**, paste the complete contents of
`supabase-free-hub.sql`, and run it once. Confirm that `resources` and
`resource_progress` appear in Table Editor.

## 2. Configure authentication URLs

In **Authentication > URL Configuration** set:

- Site URL: `https://futuremakers.dev`
- Redirect URLs:
  - `https://futuremakers.dev/auth-callback`
  - `https://www.futuremakers.dev/auth-callback`
  - `http://localhost:4173/auth-callback`

Keep only the production host that Cloudflare treats as canonical after testing.

## 3. Enable email sign-in

In **Authentication > Providers > Email**, keep email enabled. Magic-link sign-in
is used by the site. Customize the email template and sender before a public launch.

## 4. Enable OAuth providers

Enable Google and GitHub in **Authentication > Providers**. Create each provider's
OAuth application using the callback URL shown by Supabase, then store the provider
client ID and secret only in Supabase. Never put either provider secret in GitHub.

If a provider is not enabled yet, temporarily remove or hide its button from
`login.html` until its complete sign-in flow has been tested.

## 5. Cloudflare deployment check

After the repository deploys, verify these routes:

- `/login`
- `/signup`
- `/auth-callback`
- `/free-hub`

Test email magic link, Google, and GitHub in a private browser window. Confirm an
unauthenticated visit to `/free-hub` redirects to `/login`, and confirm progress is
saved after signing out and returning.

## Security notes

- The `sb_publishable_...` browser key is intentionally public.
- Never commit a service-role key, `sb_secret_...` key, database password, JWT
  secret, or OAuth provider secret.
- Row Level Security limits progress records to the authenticated owner.
- Free guide URLs are not digital-rights enforcement; downloaded resources can be
  shared. The account provides organization, progress, and a returning-user path.
