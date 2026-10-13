import supabase from '../lib/supabase.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) return res.status(404).json({ error: 'Not connected yet' });
  return res.json({ 
    id: data.id,
    fb_page_name: data.fb_page_name,
    fb_page_id: data.fb_page_id,
    ig_user_id: data.ig_user_id,
    connected_at: data.connected_at,
    is_connected: !!data.fb_page_token
  });
}
