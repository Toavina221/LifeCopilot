// Test d'intégration direct de la clé GEMINI_API_KEY (hors vitest)
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("GEMINI_API_KEY non configuré");
  process.exit(1);
}

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "Tu es l'assistant de LifeCopilot, réponds en français en une phrase." }],
      },
      contents: [
        { role: "user", parts: [{ text: "Dis bonjour en une phrase courte." }] },
      ],
    }),
  }
);

const text = await res.text();
if (!res.ok) {
  // Extraire le délai retry du message ("Please retry in Xs") ou du Retry-After
  const delayMatch = /retry in ([0-9.]+)s/i.exec(text);
  const delay = delayMatch ? Math.ceil(Number(delayMatch[1])) + 2 : 20;
  console.error(`HTTP ${res.status} (quota 20 req/min) — réessai après ${delay} s`);
  await new Promise((r) => setTimeout(r, delay * 1000));
  // Nouvel appel après l'attente
  const retryRes = await fetch(res.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: "Tu es l'assistant de LifeCopilot, réponds en français en une phrase." }],
      },
      contents: [{ role: "user", parts: [{ text: "Dis bonjour en une phrase courte." }] }],
    }),
  });
  const retryText = await retryRes.text();
  if (!retryRes.ok) {
    console.error(`Réessai échoué HTTP ${retryRes.status}: ${retryText.slice(0, 300)}`);
    process.exit(1);
  }
  text = retryText;
}

const data = JSON.parse(text);
const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
if (typeof reply !== "string" || reply.trim().length === 0) {
  console.error("Réponse vide :", text.slice(0, 300));
  process.exit(1);
}

console.log("Gemini OK →", reply);
process.exit(0);
