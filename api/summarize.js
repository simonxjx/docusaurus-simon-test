module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY not set");

    const { text } = req.body || {};
    if (!text) throw new Error("No text provided");

    // 将文章拆成较短的段落，每段不超过 3000 字
    const chunkSize = 3000;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    let allBullets = [];

    for (const chunk of chunks) {
      const prompt = `Summarize the following technical documentation in 4–6 bullet points, ignoring images/code/tables:\n\n${chunk}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
          }),
        }
      );

      const data = await response.json();
      console.log("Gemini Response:", JSON.stringify(data, null, 2));

      const bulletsText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      // 按行拆分 bullet points
      const bullets = bulletsText
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("•") ? true : true); // 保留非空行

      allBullets.push(...bullets);
    }

    const summary = allBullets.join("\n");

    res.status(200).json({ summary: summary || "AI could not generate a summary." });

  } catch (err) {
    console.error("Serverless Error:", err);
    res.status(500).json({ error: err.message });
  }
};