import "dotenv/config";
import { geminiChat, isGeminiConfigured } from "../server/gemini";

async function main() {
  console.log("Gemini configuré:", isGeminiConfigured());
  try {
    const r = await geminiChat({
      system: "Réponds brièvement en français.",
      messages: [{ role: "user", content: "Comment résilier mon abonnement téléphonique ?" }],
    });
    console.log("geminiChat OK:", r.slice(0, 80));
  } catch (e) {
    console.log("geminiChat ERROR:", String(e).slice(0, 300));
  }
}
main();
