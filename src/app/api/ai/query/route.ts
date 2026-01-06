import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';
import { db } from '@/db';
import { embeddings } from '@/db/schema';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
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
    if (similarContent.length === 0) {
      return new Response('I am a private advisor. I can only answer questions based on the knowledge base provided by Mohammad Al Qudah.', { status: 200 });
    }

    const result = streamText({
      model: openai('gpt-4o'),
      system: `
        You are a private/strict advisor for Mohammad Al Qudah's platform.
        You MUST ONLY answer based on the provided CONTEXT.
        If the answer is not in the context, politely state that you do not have that information in your knowledge base.
        DO NOT use outside knowledge or general training data to answer factual questions.
        
        CONTEXT:
        ${contextText}
      `,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in streamText:', error);
    return new Response('AI generation failed', { status: 500 });
  }
}
