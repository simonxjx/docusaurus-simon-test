export default async function handler(req, res) {
  const { text } = req.body;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Summarize this article:\n\n${text}`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  const summary =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary";

  res.json({ summary });
}
