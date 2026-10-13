import supabase from '../../lib/supabase.js';
import { exchangeCodeForToken, getLongLivedToken, getUserPages, getIGAccount } from '../../lib/facebook.js';

export default async function handler(req, res) {
  const { code, state } = req.query; // state = frontend user_id
  const userId = state || req.query.user_id;

  if (!code) {
    // Step 1: Redirect user to Facebook login
    const fbUserId = req.query.frontend_user_id || 'anon_' + Date.now();
    const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,instagram_basic,instagram_content_publish';
    const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FB_REDIRECT_URI)}&scope=${scope}&state=${fbUserId}&response_type=code`;
    return res.redirect(authUrl);
  }

  try {
    // Step 2: Exchange code for token
    const tokenData = await exchangeCodeForToken(code);
    if (tokenData.error) return res.status(400).json(tokenData);

    const longTokenData = await getLongLivedToken(tokenData.access_token);
    const longToken = longTokenData.access_token || tokenData.access_token;

    // Step 3: Get pages
    const pagesData = await getUserPages(longToken);
    const pages = pagesData.data || [];

    let firstPage = pages[0];
    let igAccount = null;
    if (firstPage) {
      const igData = await getIGAccount(firstPage.id, firstPage.access_token);
      igAccount = igData.instagram_business_account;
    }

    // Step 4: Save to Supabase - upsert user
    const { data, error } = await supabase.from('users').upsert({
      id: userId,
      fb_user_token: longToken,
      fb_page_id: firstPage?.id || null,
      fb_page_token: firstPage?.access_token || null,
      fb_page_name: firstPage?.name || null,
      ig_user_id: igAccount?.id || null,
      connected_at: new Date().toISOString()
    }, { onConflict: 'id' });

    // Redirect back to frontend with success
    const frontend = process.env.FRONTEND_URL || '/';
    return res.redirect(`${frontend}?connected=facebook&page=${encodeURIComponent(firstPage?.name || 'Connected')}&user_id=${userId}`);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
