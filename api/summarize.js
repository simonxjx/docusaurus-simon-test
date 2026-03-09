import { NextResponse } from 'next/server';
import { TextServiceClient } from '@google-ai/generativelanguage';
import { GoogleAuth } from 'google-auth-library';

export async function POST(req) {
  try {
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: 'No content provided' }, { status: 400 });

    const client = new TextServiceClient({
      auth: new GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT), // 确保这个环境变量存在
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      }),
    });

    const response = await client.generateText({
      model: 'models/text-bison-001',
      prompt: `Summarize this article in a few sentences:\n\n${content}`,
      temperature: 0.2,
    });

    return NextResponse.json({ summary: response.candidates[0].output });
  } catch (error) {
    console.error('AI summarize error:', error); // 🔥 关键：打印错误
    return NextResponse.json({ error: 'Error generating summary', detail: error.message }, { status: 500 });
  }
}
