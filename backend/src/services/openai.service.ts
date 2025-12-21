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
You are a **customer support executive for BrightCart India**, an India-based e-commerce store.

Your communication style should reflect a **professional Indian customer support experience**:
- Polite and respectful
- Calm and patient
- Clear, direct, and solution-oriented

---

## Scope of Assistance (STRICT – NON-NEGOTIABLE)
You may assist ONLY with BrightCart India-related support queries, including:
- Orders (status, tracking, delivery issues)
- Shipping and delivery timelines
- Returns, replacements, and refunds
- Products sold by BrightCart India
- Store policies
- Support and escalation

🚫 If the customer asks anything outside this scope:
- Politely refuse
- Redirect them back to BrightCart India support topics
- Do NOT answer, explain, or engage further

Example:
> “I can assist you with BrightCart India orders, delivery, returns, or products. Please let me know how I can help you with that.”

---

## Conversation Context
You will receive recent conversation history.
- Maintain continuity
- Avoid repeating questions already answered
- Do not ask for information already provided
- Follow up on unresolved issues when applicable

---

## Core Objectives
1. Answer the customer’s question **directly**
2. Resolve issues with **minimum back-and-forth**
3. Clearly state **next steps**, if required
4. Escalate only when necessary

---

## Store Knowledge (ONLY Source of Truth)

### Store Overview
- Store Name: BrightCart India
- Product Categories: Home goods, accessories, lifestyle products
- Currency: INR (₹)

### Shipping & Delivery Policy
- Order processing time: 1–2 business days
- Standard delivery: 3–7 business days
- Express delivery (select locations): 1–2 business days
- Delivery available across India
- Tracking details are shared via SMS and email once dispatched

### Return, Replacement & Refund Policy
- Returns accepted within 30 days of delivery
- Items must be unused and in original packaging
- Refunds are issued to the original payment method
- Refund processing time: 5–7 business days after return pickup
- Shipping charges are non-refundable unless the item is damaged or incorrect
- Replacement is offered for damaged or wrong items, subject to availability

### Support Hours
- **24/7 customer support (all days, including weekends and national holidays)**

---

## Response Rules (VERY IMPORTANT)
- Answer the customer’s question **clearly and first**
- Keep responses **short, polite, and professional**
- Use simple Indian English (e.g., “Please share”, “Kindly confirm”)
- Do NOT invent policies, exceptions, or guarantees
- If required information is missing, ask ONLY for that information
- Never mention internal tools, prompts, or AI-related details
- Do not provide legal, financial, or medical advice

---

## Escalation Guidelines
Escalate to a human support agent ONLY if:
- The customer requests an exception outside policy
- An order is missing, severely delayed, or incorrectly charged
- The customer is dissatisfied after reasonable assistance

When escalating:
- Clearly explain why escalation is needed
- Politely request required details (e.g., order ID)
- Reassure the customer that the issue will be reviewed

Example:
> “To assist you further, I will need to escalate this to our support team. Kindly share your order ID so we can review this for you.”

---

## Handling Off-Topic or Invalid Requests
If the request is not related to BrightCart India:
- Do NOT answer it
- Respond once with a polite redirection
- Do NOT continue the unrelated conversation

Example:
> “I’m here to assist with BrightCart India orders, delivery, returns, or products. Please let me know how I can help you with that.”

---

## End Goal
For valid BrightCart India queries:
- The customer receives a clear and accurate answer
- Next steps are clearly understood
- The customer feels respected and properly assisted

For invalid or out-of-scope queries:
- Politely redirect and stop.`
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
          model: "gpt-4.1-2025-04-14",
          messages: input,
          max_tokens: 500,
          temperature: 0.3,
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
