// api/summarize.ts
export default async function handler(req: any, res: any) {
  // 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text in request body" });
  }

  // 测试响应
  return res.status(200).json({ summary: `Received text: ${text}` });
}
