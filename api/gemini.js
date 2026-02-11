export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://aix-boost.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await fetch(
      // 모델명을 공식 명칭으로 수정
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + 
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    // ✅ 구글 API 응답에서 텍스트만 추출하여 전달
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: generatedText });
    } else {
      res.status(500).json({ error: "Unexpected API response format" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
