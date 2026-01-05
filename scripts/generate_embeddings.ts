import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function generateEmbeddings() {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('../src/db');
    const { embeddings, posts, courses } = await import('../src/db/schema');

    console.log('Fetching content...');

    // Fetch Posts
    const allPosts = await db.select().from(posts);
    console.log(`Found ${allPosts.length} posts.`);

    // Fetch Courses
    const allCourses = await db.select().from(courses);
    console.log(`Found ${allCourses.length} courses.`);

    const records = [
        ...allPosts.map(p => ({
            id: p.id,
            type: 'post',
            content: `Post Title: ${p.title}\n\n${JSON.stringify(p.content)}` // Content is JSONB, simplify for now
        })),
        ...allCourses.map(c => ({
            id: c.id,
            type: 'course',
            content: `Course Title: ${c.title}\nDescription: ${c.description}`
        }))
    ];

    if (records.length === 0) {
        console.log('Database likely empty. Seeding manual context...');
        records.push({
            id: crypto.randomUUID(),
            type: 'manual',
            content: `Mohammad Al Qudah is a Full Stack Architect specializing in Next.js.
He believes in 'Bleeding Edge' tech stacks.
He is currently building a personal authority platform using Next.js 15, Tailwind v4, Drizzle, and Sanity.`
        });
    }

    console.log(`Generating embeddings for ${records.length} items...`);

    for (const record of records) {
        try {
            console.log(`Processing: ${record.type} - ${record.id}`);

            // Generate Embedding
            const { embedding } = await embed({
                model: openai.embedding('text-embedding-3-small'),
                value: record.content,
            });

            // Insert into DB
            await db.insert(embeddings).values({
                content: record.content,
                embedding: embedding,
                relatedId: record.id,
                type: record.type,
            });

        } catch (error) {
            console.error(`Failed to process ${record.id}:`, error);
        }
    }

    console.log('✅ Embedding generation complete.');
    process.exit(0);
}

generateEmbeddings().catch(console.error);
