import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const ChatInput = z.object({
  messages: z.array(MessageSchema).min(1),
  model: z.string().optional(),
});

export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const model = data.model ?? "google/gemini-2.5-flash";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model,
        messages: data.messages,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (res.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices: Array<{ message: { role: string; content: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });
