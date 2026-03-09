// api/summarize.js (CommonJS)
const { TextServiceClient } = require('@google-ai/generativelanguage');
const { GoogleAuth } = require('google-auth-library');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'No content provided' });

    const client = new TextServiceClient({
      auth: new GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      }),
    });

    const response = await client.generateText({
      model: 'models/text-bison-001',
      prompt: `Summarize this article in a few sentences:\n\n${content}`,
      temperature: 0.2,
    });

    res.json({ summary: response.candidates[0].output });
  } catch (error) {
    console.error('AI summarize error:', error);
    res.status(500).json({ error: 'Error generating summary', detail: error.message });
  }
};
