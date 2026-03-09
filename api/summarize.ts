// api/summarize.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  summary?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
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
