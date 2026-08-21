/**
 * Couche LLM indépendante : OpenRouter (compatible OpenAI API).
 *
 * Utilisée quand OPENROUTER_API_KEY est configuré. Sinon,
 * le site bascule automatiquement sur l'API Manus intégrée
 * (invitée par fallback dans routers.ts si besoin).
 *
 * OpenRouter offre un quota gratuit et des modèles peu coûteux
 * (gemini-flash, gpt-4o-mini, claude-haiku…) accessibles via
 * une seule clé, sans compte fournisseur multiple.
 */

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenRouterResponse = {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function openRouterChat(params: {
  messages: OpenRouterMessage[];
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY n'est pas configuré");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "http-referer": "https://lifecopilot.manus.space",
      "x-title": "LifeCopilot",
    },
    body: JSON.stringify({
      model: params.model ?? "google/gemini-2.5-flash",
      messages: params.messages,
      ...(params.maxTokens ? { max_tokens: params.maxTokens } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} – ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("OpenRouter returned an empty response");
  }
  return content;
}

/**
 * Extrait un JSON structuré depuis une réponse OpenRouter.
 * Utilisé pour le détecteur d'arnaques (verdict structuré).
 */
export async function openRouterStructured<T>(params: {
  messages: OpenRouterMessage[];
  model?: string;
  parse: (text: string) => T;
}): Promise<T> {
  const text = await openRouterChat(params);
  return params.parse(text);
}
