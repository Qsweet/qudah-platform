import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';
import { db } from '@/db';
import { embeddings } from '@/db/schema';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response('Invalid request body', { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  const query = lastMessage.content;

  console.log('Processing RAG Query:', query);

  // 1. Generate Embedding for the query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // 2. Search for relevant context
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, embedding)})`;

  const similarContent = await db
    .select({
      content: embeddings.content,
      similarity
    })
    .from(embeddings)
    .where(gt(similarity, 0.5)) // Threshold
    .orderBy(desc(similarity))
    .limit(3);

  const contextText = similarContent.length > 0
    ? similarContent.map(c => c.content).join('\n---\n')
    : 'No specific context found. Answer generally.';

  console.log(`Found ${similarContent.length} relevant items.`);

  // 3. Stream Response
  try {
    const result = streamText({
      model: openai('gpt-4o'),
      system: `
        You are Qudah-GPT, an AI assistant for Mohammad Al Qudah's personal platform.
        Use the following context to answer the user's question.
        
        CONTEXT:
        ${contextText}
      `,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in streamText:', error);
    return new Response('AI generation failed', { status: 500 });
  }
}
