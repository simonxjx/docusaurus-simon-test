// api/summarize.js (Vercel Serverless Function)
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    let text = "";

    if (req.method === "POST") {
      const body = await req.json();
      // 支持 base64 编码的中文
      if (body.text && body.text.match(/^[A-Za-z0-9+/=]+$/)) {
        text = decodeURIComponent(escape(atob(body.text)));
      } else {
        text = body.text || "";
      }
    } else {
      text = req.query.text || "";
    }

    if (!text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    text = text.slice(0, 15000); // 硬限制

    const isChinese = /[\u4e00-\u9fa5]/.test(text.slice(0, 300));

    const prompt = isChinese
      ? `请阅读以下技术文档，生成**结构化**的简洁摘要。只输出 HTML，不要任何多余说明。

**目的与范围**：

一句话说明文档目标和覆盖范围。

**核心价值**：

一句话说明读者能获得什么帮助。

**关键内容速览**：

- 要点 1
- 要点 2
- 要点 3
- ...

严格忽略：图片、代码块、表格、注释、页脚

文档：
${text}`
      : `...英文版 prompt 同理...`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.15,
            topP: 0.9,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    let summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    // 更强力清理
    summary = summary
      .replace(/^```html?|```$/g, "")
      .replace(/^\s*[\r\n]+/, "")
      .replace(/[\r\n]+\s*$/, "")
      .trim();

    res.status(200).json({ summary: summary || (isChinese ? "暂无摘要" : "No summary generated") });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};