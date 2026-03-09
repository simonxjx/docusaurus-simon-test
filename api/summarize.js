module.exports = async (req, res) => {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {

    const rawText = req.body.text || "";

    // 防止文章过长
    const text = rawText.slice(0, 20000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize the following article in clear bullet points:\n\n${text}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300
          }
        })
      }
    );

    const data = await response.json();

    console.log(JSON.stringify(data, null, 2));

    const summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI could not generate a summary.";

    res.status(200).json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
