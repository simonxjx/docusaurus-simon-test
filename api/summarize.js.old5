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

    let text = body.text || "";
    if (!text) throw new Error("No text provided");

    // 限制最大长度 (防止 token 爆)
    text = text.slice(0, 10000);

    // 🌍 自动检测语言
    const isChinese = /[\u4e00-\u9fa5]/.test(text.slice(0, 200));

    // 🧠 Prompt
    let prompt;

    if (isChinese) {
      prompt = `
请阅读以下技术文档，并生成4-6条简洁的要点总结。

要求：
- 使用项目符号
- 每条一句话
- 忽略图片、代码块和表格
- 只保留核心信息

文档：
${text}
`;
    } else {
      prompt = `
Read the following technical documentation and summarize it into 4-6 bullet points.

Requirements:
- One sentence per bullet
- Use bullet points
- Ignore images, code blocks, and tables
- Focus only on key information

Document:
${text}
`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500
          },
        }),
      }
    );

    const data = await response.json();

    let summary = "AI could not generate a summary.";

    if (data.candidates?.[0]?.content?.parts?.length) {
      summary = data.candidates[0].content.parts[0].text.trim();
    }

    res.status(200).json({ summary });

  } catch (err) {
    console.error("Serverless Error:", err);
    res.status(500).json({ error: err.message });
  }
};