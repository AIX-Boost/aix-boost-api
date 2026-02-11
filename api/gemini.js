export default async function handler(req, res) {
  // ✅ CORS (GitHub Pages에서 호출할 거니까)
  res.setHeader("Access-Control-Allow-Origin", "https://aix-boost.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  // ✅ 여기서 모델만 바꾸면 됨
  const MODEL = "gemini-2.5-flash"; // 또는 "gemini-2.5-flash-lite"
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=` +
    process.env.GEMINI_API_KEY;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await r.json().catch(() => ({}));

    // ✅ 구글이 에러를 준 경우: 상태코드 그대로 전달
    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "Gemini API error",
        raw: data,
      });
    }

    // ✅ 성공: text만 깔끔하게 추출해서 프론트에 전달
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}

