import { supabase } from './supabase.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Підтримка фільтрації за id через query string
    const { id } = req.query;
    let query = supabase.from('clients').select('*');
    if (id) query = query.eq('id', id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    const { data: inserted, error } = await supabase.from('clients').insert([req.body]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(inserted[0]);
  } else if (req.method === 'PATCH') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { data, error } = await supabase.from('clients').update(req.body).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data && data.length ? data[0] : {});
  } else {
    res.status(405).end();
  }
}
