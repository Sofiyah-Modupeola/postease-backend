# PostEase Multi-Tenant Backend - One Backend, Many Users

## Deploy Steps (15 mins)

1. Supabase: Create project -> SQL Editor -> paste supabase-schema.sql -> Run

2. Facebook Developers: My Apps -> PostEase app -> Settings -> Basic -> copy App ID and Secret. Add Valid OAuth Redirect URI: https://your-vercel-project.vercel.app/api/auth/facebook

3. Vercel: Import this folder -> Add Env Vars:
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_KEY (from Supabase Settings -> API -> service_role)
   FB_APP_ID
   FB_APP_SECRET
   FB_REDIRECT_URI = https://your-project.vercel.app/api/auth/facebook
   FRONTEND_URL = https://your-frontend.vercel.app or your one-click artifact URL

4. Deploy -> Test: Open frontend, click Connect with Facebook -> login -> should redirect back with ?connected=facebook

5. Frontend integration: In your one-click frontend, set:
   const BACKEND_URL = 'https://your-project.vercel.app';
   - Connect button: window.location.href = `${BACKEND_URL}/api/auth/facebook?frontend_user_id=${userId}`
   - Queue API: `${BACKEND_URL}/api/queue?user_id=${userId}`

## How it works for many users
- Vendor A connects: token saved as user_id = vendor_a_123
- Vendor B connects: token saved as vendor_b_456
- Cron runs every 15 mins: SELECT * FROM queue WHERE status=queued AND scheduledAt <= now. For each post, uses that user's own fb_page_token to post to THEIR page.

No user ever touches backend or env vars.

## Cost
Vercel free (cron), Supabase free (500MB), Facebook API free.
