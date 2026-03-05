/**
 * Provider-agnostic LLM abstraction layer.
 * Swap providers via LLM_PROVIDER env var ("openai" | "anthropic").
 * Each provider uses raw fetch — no SDK dependencies required.
 */

export type LLMProvider = "openai" | "anthropic";

interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}

function getConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER ?? "openai") as LLMProvider;

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    return {
      provider,
      apiKey,
      model: process.env.LLM_MODEL ?? "claude-sonnet-4-20250514",
    };
  }

  // Default: openai
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return {
    provider,
    apiKey,
    model: process.env.LLM_MODEL ?? "gpt-4o-mini",
  };
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const config = getConfig();

  if (config.provider === "anthropic") {
    return callAnthropic(config, systemPrompt, userMessage);
  }
  return callOpenAI(config, systemPrompt, userMessage);
}

async function callOpenAI(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}
