module.exports = async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {

    let text = "";

    if (req.method === "GET") {

      const encoded = req.query.text || "";

      if (!encoded) throw new Error("No text provided");

      text = decodeURIComponent(
        escape(Buffer.from(encoded, "base64").toString())
      );

    } else if (req.method === "POST") {

      const body = req.body || {};
      text = body.text || "";

    }

    if (!text) throw new Error("Empty text");

    // 防止 token 爆
    text = text.slice(0, 8000);

    const isChinese = /[\u4e00-\u9fa5]/.test(text.slice(0, 200));

    const prompt = isChinese
      ? `阅读技术文档并生成HTML摘要。

规则：

忽略图片、代码块、表格  
输出 **纯HTML**  
不要 markdown  
不要 \`\`\`

结构：

<strong>目的与范围：</strong>
1-2句话说明文档目的

<br/><br/>

<strong>价值说明：</strong>
1-2句话说明读者能解决什么问题

<br/><br/>

<strong>内容快速概览：</strong>

<ul>
<li>3-5条关键要点</li>
</ul>

文档：

${text}`
      : `Read the technical document and generate a HTML summary.

Rules:

Ignore images, code blocks, tables  
Output pure HTML  
Do NOT use markdown

Structure:

<strong>Purpose & Scope:</strong>

1-2 sentences

<br/><br/>

<strong>Value Proposition:</strong>

1-2 sentences

<br/><br/>

<strong>Quick Summary:</strong>

<ul>
<li>3-5 key points</li>
</ul>

Document:

${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800
          }
        })
      }
    );

    const data = await response.json();

    let summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 清理 markdown 包裹
    summary = summary
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    if (!summary) {
      summary = isChinese
        ? "AI 未能生成摘要。"
        : "AI could not generate a summary.";
    }

    res.status(200).json({ summary });

  } catch (err) {

    console.error("Serverless Error:", err);

    res.status(500).json({ error: err.message });

  }
};