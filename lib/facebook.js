import fetch from 'node-fetch';

export async function exchangeCodeForToken(code) {
  const params = new URLSearchParams({
    client_id: process.env.FB_APP_ID,
    client_secret: process.env.FB_APP_SECRET,
    redirect_uri: process.env.FB_REDIRECT_URI,
    code
  });
  const res = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?${params}`);
  return await res.json(); // { access_token, token_type, expires_in }
}

export async function getLongLivedToken(shortToken) {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.FB_APP_ID,
    client_secret: process.env.FB_APP_SECRET,
    fb_exchange_token: shortToken
  });
  const res = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?${params}`);
  return await res.json();
}

export async function getUserPages(userAccessToken) {
  const res = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${userAccessToken}`);
  return await res.json();
}

export async function getIGAccount(pageId, pageToken) {
  const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`);
  return await res.json();
}

export async function postToPage(pageId, pageToken, message, imageUrl) {
  const url = `https://graph.facebook.com/v20.0/${pageId}/photos`;
  const p = new URLSearchParams();
  p.append('message', message);
  p.append('url', imageUrl);
  p.append('access_token', pageToken);
  const res = await fetch(url, { method: 'POST', body: p });
  return await res.json();
}
