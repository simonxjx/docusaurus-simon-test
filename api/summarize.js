// api/summarize.js
// Node 18+ 自带 fetch，如果是老版本可以 npm install node-fetch

module.exports = async (req, res) => {
  // 仅允许 POST
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // 跨域允许（如果 Docusaurus 部署在其他域名）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: 'No text provided' });

    const apiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`, // 在 Vercel Dashboard 配置
        },
        body: JSON.stringify({
          prompt: `Summarize the following article:\n${text}`,
          temperature: 0.5,
          maxOutputTokens: 200,
        }),
      }
    );

    const data = await apiResponse.json();

    // 返回摘要
    res.status(200).json({ summary: data.candidates[0].output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
