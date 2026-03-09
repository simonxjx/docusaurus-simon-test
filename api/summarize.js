export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { text } = req.body;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `Summarize the following article:\n${text}`,
        temperature: 0.5,
        maxOutputTokens: 200,
      }),
    }
  );

  const data = await response.json();
  res.status(200).json({ summary: data.candidates[0].output });
}
