// /api/proxy.js
export default async function handler(req, res) {
  try {
    const body = req.method === "POST" ? req.body : req.query;

    if (!body.text) {
      return res.status(400).json({ error: "Missing text" });
    }

    // 调用原 summarize API
    const apiRes = await fetch(
      "https://docusaurus-simon-test.vercel.app/api/summarize",
      {
        method: "POST", // POST 更稳定，避免 URL 超长
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body.text }),
      }
    );

    const data = await apiRes.text(); // 原 API 返回 JSON 或 HTML

    res.setHeader("Access-Control-Allow-Origin", "*"); // 支持 CORS
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy failed" });
  }
}