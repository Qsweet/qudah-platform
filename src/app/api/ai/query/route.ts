import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt } = await req.json();

    // Validate Input
    const schema = z.object({
        prompt: z.string().min(5),
    });

    const parsed = schema.safeParse({ prompt });

    if (!parsed.success) {
        return new Response('Invalid prompt. Must be at least 5 characters.', { status: 400 });
    }

    // SIMULATED RETRIEVAL (RAG Placeholder)
    // In a real scenario, we would vector search Pinecone/Weaviate here.
    const context = `
    Mohammad Al Qudah is a Full Stack Architect specializing in Next.js.
    He believes in 'Bleeding Edge' tech stacks.
    He is currently building a personal authority platform using Next.js 15, Tailwind v4, Drizzle, and Sanity.
  `;

    // Stream Response
    const result = streamText({
        model: openai('gpt-4o'), // Or 'gpt-3.5-turbo' depending on env
        system: `
      You are Qudah-GPT, an AI assistant for Mohammad Al Qudah's personal platform.
      Use the following context to answer the user's question.
      
      CONTEXT:
      ${context}
    `,
        messages: [
            { role: 'user', content: parsed.data.prompt }
        ],
    });

    return result.toTextStreamResponse();
}
