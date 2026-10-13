import supabase from '../lib/supabase.js';
import { postToPage } from '../lib/facebook.js';

export default async function handler(req, res) {
  // Security: Vercel cron header
  // if (req.headers['x-vercel-cron'] !== '1') check secret

  const nowWAT = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));

  // Get all queued posts whose scheduledAt <= now and status queued
  const { data: posts, error } = await supabase.from('queue').select('*, users!inner(fb_page_id, fb_page_token, ig_user_id)').eq('status', 'queued').lte('scheduledAt', nowWAT.toISOString()).limit(20);

  if (error) return res.status(500).json({ error: error.message });

  let posted = 0;
  for (let post of posts) {
    try {
      // Mark as posting to avoid double post
      await supabase.from('queue').update({ status: 'posting' }).eq('id', post.id);

      const user = post.users;
      if (!user || !user.fb_page_id || !user.fb_page_token) {
        await supabase.from('queue').update({ status: 'failed', error: 'No page token' }).eq('id', post.id);
        continue;
      }

      // Post to Facebook Page if platform includes Facebook
      if (post.platforms?.some(p => p.toLowerCase().includes('facebook') || p.toLowerCase().includes('page'))) {
        const fbRes = await postToPage(user.fb_page_id, user.fb_page_token, post.caption, post.imageUrl);
        console.log('FB post result', fbRes);
      }

      // Instagram posting similar - add media container logic here
      // For brevity, FB is main demo

      await supabase.from('queue').update({ status: 'posted', postedAt: new Date().toISOString() }).eq('id', post.id);
      posted++;
    } catch (e) {
      console.error('Post failed', e);
      await supabase.from('queue').update({ status: 'failed', error: e.message }).eq('id', post.id);
    }
  }

  return res.status(200).json({ ok: true, checked: posts?.length || 0, posted, time: nowWAT.toISOString() });
}
