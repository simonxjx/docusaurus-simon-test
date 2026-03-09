// api/summarize.js
export default async function handler(req, res) {
  // CORS 支持
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const rawText = req.body.text || "";

    // 截断文章防止 token 超限
    const text = rawText.slice(0, 12000);

    // Gemini 2.5 Flash API 请求
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an AI assistant that summarizes technical documentation.

Instructions:
- Summarize the article in 4–6 concise bullet points
- Focus on key concepts and steps
- Ignore images, code blocks, tables
- Use simple developer-friendly language

Article:
${text}`
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

    // 安全解析 summary
    let summary = "AI could not generate a summary.";
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content?.parts?.length
    ) {
      summary = data.candidates[0].content.parts[0].text;
    }

    res.status(200).json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
