module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY not set");

    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => data += chunk);
      req.on("end", () => resolve(JSON.parse(data)));
      req.on("error", reject);
    });

    const text = (body.text || "").slice(0, 12000);
    if (!text) throw new Error("No text provided");

    const prompt = `
You are a technical documentation summarizer.
Summarize the following text in 4–6 bullet points.
Do NOT write any introduction like "Here's a summary of ...".
Focus on main ideas and instructions only.
Ignore images, code, and tables.
Each bullet should be concise and self-contained.

Text:

${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
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

    let summary = "AI could not generate a summary.";
    if (data.candidates?.[0]?.content?.parts?.length) {
      summary = data.candidates[0].content.parts[0].text;
    }

    res.status(200).json({ summary });

  } catch (err) {
    console.error("Serverless Error:", err);
    res.status(500).json({ error: err.message });
  }
};
