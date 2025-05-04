export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  console.log('Client Log:', body);

  res.status(200).json({ message: 'Log received' });
}
