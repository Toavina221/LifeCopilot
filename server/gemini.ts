/**
 * Couche LLM indépendante : Google Gemini (Generative AI API).
 *
 * Utilisée quand GEMINI_API_KEY est configuré (Google AI Studio,
 * quota gratuit, sans dépôt). Sinon, fallback sur l'API Manus intégrée.
 *
 * Modèle retenu : gemini-flash-latest (peu coûteux/gratuit, rapide,
 * suffisant pour le guidage, la rédaction de courriers et l'analyse anti-arnaque).
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export type GeminiMessage = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

export type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
};

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Throttler global : le quota gratuit Gemini free-tier limite à ~20
 * requêtes/min globales. On impose un appel toutes les 4 secondes
 * (15 req/min, marge de sécurité) avec une file d'attente unique.
 */
let lastGeminiCallAt = 0;
let pendingGemini: Promise<unknown> = Promise.resolve();

// Quota free-tier : ~20 req/min globales. On impose ~8 req/min pour
// laisser de la marge aux autres consommateurs (tests, UI, autres routes).
const GEMINI_MIN_INTERVAL_MS = 7000;

/**
 * Circuit breaker sur 429 free-tier : quand l'API signale un quota épuisé
 * (RetryInfo), on mémorise jusqu'à quand rejeter immédiatement les appels
 * au lieu de les empiler dans la file et d'aggraver la saturation.
 */
let geminiBlockedUntil = 0;
let geminiFailedCount = 0;

function enqueueGemini<T>(fn: () => Promise<T>): Promise<T> {
  const previous = pendingGemini;
  const next = previous
    .catch(() => {}) // isoler les chaînes : l'échec d'un appel ne bloque pas la file
    .then(async () => {
      const now = Date.now();
      const waitMs = Math.max(0, lastGeminiCallAt + GEMINI_MIN_INTERVAL_MS - now);
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
      lastGeminiCallAt = Date.now();
      return fn();
    });
  pendingGemini = next;
  return next as Promise<T>;
}

/**
 * Appelle Gemini en générant un contenu texte.
 * Les system prompts sont convertis en instruction (systemInstruction).
 */
export async function geminiChat(params: {
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY n'est pas configuré");
  }

  // La première réponse "model" d'un utilisateur ne peut pas commencer
  // un dialogue Gemini : on préfixe par un message utilisateur vide si besoin.
  const contents: GeminiMessage[] = [];
  for (const m of params.messages) {
    contents.push({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    });
  }
  if (contents.length > 0 && contents[0].role !== "user") {
    contents.unshift({ role: "user", parts: [{ text: " " }] });
  }

  const payload: Record<string, unknown> = { contents };
  if (params.system) {
    payload.systemInstruction = { parts: [{ text: params.system }] };
  }

  // Tous les appels passent par le throttler global pour respecter le quota.
  if (Date.now() < geminiBlockedUntil) {
    throw new Error(
      "Le service IA gratuit Google est temporairement saturé (quota dépassé). Veuillez réessayer dans quelques instants."
    );
  }
  return enqueueGemini(() => performGeminiCall(payload));
}

async function performGeminiCall(payload: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY n'est pas configuré");
  }

  const maxAttempts = 3;
  let parsedData: GeminiGenerateResponse | undefined;
  let errorText = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      // Le corps JSON est lu une seule fois, juste après une réponse OK :
      // on évite ainsi l'erreur « Body has already been read » quand le
      // corps texte d'une erreur avait déjà été consommé lors d'une
      // tentative précédente.
      parsedData = (await response.json()) as GeminiGenerateResponse;
      break;
    }
    errorText = await response.text();
    const retryable = response.status === 429 || response.status === 503;
    if (!retryable || attempt === maxAttempts) {
      // Sur 429 free-tier : activer le circuit breaker via le RetryInfo de
      // Google (souvent ~18-60 s) pour éviter de marteler le quota.
      if (response.status === 429) {
        geminiFailedCount += 1;
        const retryMatch = /retry in ([0-9.]+)s/i.exec(errorText);
        const seconds = retryMatch ? Number(retryMatch[1]) + 2 : 60;
        // Si les échecs s'accumulent, le blocage devient long : les appels
        // suivants basculent automatiquement sur le fallback Manus (déjà
        // câblé dans routers.ts) au lieu de retenter Gemini.
        if (geminiFailedCount >= 4) {
          geminiBlockedUntil = Date.now() + 15 * 60 * 1000; // 15 min
          console.warn("[Gemini] Quota free-tier durablement épuisé — bascule vers le fallback Manus");
        } else {
          geminiBlockedUntil = Date.now() + Math.min(seconds * 1000, 300000);
        }
        // On remonte l'échec immédiatement (sans retry local) : le délai
        // Google est long (~30-60 s) et routers.ts bascule directement sur
        // le fallback Manus, ce qui évite une latence perçue de plusieurs
        // minutes avant d'obtenir une réponse.
        throw new Error(
          `Gemini request failed: ${response.status} – ${errorText}`
        );
      } else {
        geminiFailedCount = 0;
        throw new Error(
          `Gemini request failed: ${response.status} – ${errorText}`
        );
      }
    }
    // Le quota gratuit impose ~20 requêtes/min (limite par minute globale).
    // Seul le 503 est retrayé localement (backoff) : le 429 est traité
    // ci-dessus avec bascule immédiate vers le fallback.
    const delayMs = 10000 * Math.pow(2, attempt - 1);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  // parsedData est défini lors du break sur une réponse OK.
  const text = parsedData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
