// Test direct du fallback Manus LLM (invokeLLM) — même charge que chat.complete
import "dotenv/config";
import { invokeLLM } from "../server/_core/llm.js";

const messages = [
  {
    role: "system",
    content: "Tu es LifeCopilot, l'assistant qui aide les gens à accomplir les démarches de la vie quotidienne. Réponds en français, de manière concise.",
  },
  { role: "user", content: "Comment résilier mon abonnement téléphonique ?" },
];

try {
  console.log("Appel invokeLLM...");
  const resp = await invokeLLM({ model: "gemini-flash-latest", messages });
  const content = resp.choices?.[0]?.message?.content;
  console.log("Réponse brute:", JSON.stringify(resp).slice(0, 500));
  console.log("Contenu:", content);
} catch (e) {
  console.error("Échec invokeLLM:", e?.message || e);
}
