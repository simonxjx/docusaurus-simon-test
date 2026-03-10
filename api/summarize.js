module.exports = async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {

    const encoded = req.query.text || "";

    if (!encoded) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Base64 解码
    const text = decodeURIComponent(
      escape(Buffer.from(encoded, "base64").toString())
    ).slice(0, 8000);

    const isChinese = /[\u4e00-\u9fa5]/.test(text.slice(0, 200));

    const prompt = isChinese
      ? `阅读技术文档并生成HTML摘要。

忽略图片、代码块、表格。

输出HTML格式。

结构：

<strong>目的与范围：</strong>
1-2句话说明文档目的

<br/><br/>

<strong>价值说明：</strong>
1-2句话说明读者可以解决什么问题

<br/><br/>

<strong>内容快速概览：</strong>

<ul>
<li>3-5条关键要点</li>
</ul>

文档：
${text}`
      : `Read the technical document and generate a HTML summary.

Ignore images, code blocks and tables.

Output pure HTML.

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

    console.error(err);

    res.status(500).json({ error: err.message });

  }
};