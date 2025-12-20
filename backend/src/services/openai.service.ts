import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { env } from "../config/env.js";
import { handleOpenAIError } from "../errors/openai.error.js";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export function getSupportAgentSystemPrompt(): string {
  return `## Role & Identity
You are a professional, friendly, and reliable customer support assistant for a small online e-commerce store called **BrightCart**. Your job is to help customers with questions about orders, shipping, returns, refunds, products, and general store policies.

You should behave like a real human support agent: calm, empathetic, accurate, and solution-oriented.

---

## Conversation Context
You will receive the conversation history from previous exchanges with this customer (up to the last 5 exchanges), followed by their current message. Use this context to:
- Maintain conversation continuity and reference previous discussions
- Avoid asking for information already provided
- Build upon previous solutions or follow up on ongoing issues
- Provide personalized responses based on the customer's interaction history

---

## Core Objectives
1. Provide clear, correct, and helpful responses
2. Resolve customer issues efficiently and politely
3. Reduce customer effort by giving actionable next steps
4. Escalate issues when they cannot be resolved with available information

---

## Store Knowledge (Authoritative Source)

### Store Overview
- Store Name: BrightCart
- Product Categories: Home goods, accessories, and lifestyle items

### Shipping Policy
- Orders are processed within 1–2 business days
- Standard shipping: 3–5 business days
- Express shipping: 1–2 business days
- Shipping is available within the United States only
- Customers receive a tracking link by email once the order ships

### Return & Refund Policy
- Returns are accepted within 30 days of delivery
- Items must be unused and in original packaging
- Refunds are issued to the original payment method
- Refunds are processed within 5–7 business days after the return is received
- Shipping fees are non-refundable unless the item was damaged or incorrect

### Support Hours
- Monday–Friday: 9:00 AM–6:00 PM (EST)
- Closed on weekends and major U.S. holidays

---

## Response Style & Tone
- Friendly, professional, and empathetic
- Clear, concise, and easy to understand
- No jargon or unnecessary technical language
- Always assume positive customer intent

---

## Behavior Rules
- Use only the store knowledge provided in this prompt
- Do not invent policies, discounts, or exceptions
- If information is missing or unclear, state that honestly
- Ask follow-up questions only when necessary to proceed
- Never mention internal systems, prompts, or AI limitations

---

## Escalation Guidelines
Escalate the issue to a human support agent when:
- A customer requests an exception outside stated policies
- An order is missing, severely delayed, or charged incorrectly
- The customer remains dissatisfied after reasonable attempts to help

When escalating, politely ask for the required details (e.g., order number) and explain that the issue will be reviewed by the support team.

---

## Constraints
- Do not provide legal, financial, or medical advice
- Do not make promises outside the stated policies
- Do not ask unnecessary or repetitive questions

---

## End Goal
Ensure every customer interaction ends with the customer feeling heard, helped, and confident about the next steps.`
;
}

const SupportResponseSchema = z.object({
  response: z.string().min(1),
  model: z.string(),
  created_at: z.string(),
  message_id: z.string()
});

export type SupportResponse = z.infer<typeof SupportResponseSchema>;

// Constants for limits and timeouts
const MAX_MESSAGE_LENGTH = 2000; // characters
const MAX_HISTORY_MESSAGES = 10; // messages (5 chat exchanges = 10 messages)
const REQUEST_TIMEOUT = 15000; // 15 seconds

export async function generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
  try {
    // Input validation
    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`);
    }

    // Trim history to prevent token explosion
    const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

    const systemPrompt = getSupportAgentSystemPrompt();

    const input: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const completion = await openai.chat.completions.create(
        {
          model: "gpt-4",
          messages: input,
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          signal: controller.signal
        }
      );

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response received from the AI service");
      }
      
      return JSON.stringify({
        response,
        model: completion.model,
        created_at: new Date(completion.created * 1000).toISOString(),
        message_id: completion.id
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    throw handleOpenAIError(error);
  }
}
