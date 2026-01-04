import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Validate Input
  // Vercel AI SDK sends an array of messages.
  // We can do basic validation here if needed, or rely on the SDK type safety on frontend.
  if (!messages || !Array.isArray(messages)) {
    console.error('Invalid request body:', messages);
    return new Response('Invalid request body', { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is missing in environment variables.');
    return new Response('Server Configuration Error: Missing OpenAI API Key', { status: 500 });
  }

  console.log('Processing AI Query with messages:', messages.length);

  // SIMULATED RETRIEVAL (RAG Placeholder)
  // In a real scenario, we would vector search Pinecone/Weaviate here.
  const context = `
    Mohammad Al Qudah is a Full Stack Architect specializing in Next.js.
    He believes in 'Bleeding Edge' tech stacks.
    He is currently building a personal authority platform using Next.js 15, Tailwind v4, Drizzle, and Sanity.
  `;

  // Stream Response
  try {
    const result = streamText({
      model: openai('gpt-4o'), // Or 'gpt-3.5-turbo' depending on env
      system: `
        You are Qudah-GPT, an AI assistant for Mohammad Al Qudah's personal platform.
        Use the following context to answer the user's question.
        
        CONTEXT:
        ${context}
      `,
      messages, // Pass the messages array directly
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in streamText generation:', error);
    return new Response('AI generation failed: ' + String(error), { status: 500 });
  }
}
