import supabase from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = req.query.user_id || req.body?.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('queue').select('*').eq('user_id', userId).order('scheduledAt', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { caption, imageUrl, platforms, scheduledAt, price, productName, user_id } = req.body;
    const { data, error } = await supabase.from('queue').insert({
      user_id: user_id || userId,
      caption,
      imageUrl,
      platforms: platforms || ['Facebook Page'],
      scheduledAt: scheduledAt || new Date().toISOString(),
      price,
      productName,
      status: 'queued'
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true, item: data });
  }
}
