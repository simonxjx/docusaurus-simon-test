// api/summarize.js
const fetch = require("node-fetch"); // 如果 node 版本 >=18 可删除这行

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const rawText = req.body.text || "";
    const text = rawText.slice(0, 12000);

    const prompt = `
You are an AI assistant that summarizes technical documentation.

Instructions:
- Summarize the article in 4–6 concise bullet points
- Focus on key concepts and steps
- Ignore images, code blocks, and tables
- Use simple developer-friendly language

Article:
${text}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Response:", JSON.stringify(data, null, 2));

    // 稳定解析 summary
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
};
