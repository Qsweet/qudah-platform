import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function generateEmbeddings() {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('../src/db');
    const { embeddings, posts, courses } = await import('../src/db/schema');
    const fs = await import('fs');
    const path = await import('path');
    const pdf = require('pdf-parse'); // Use require for pdf-parse compatibility

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

    // --- File Ingestion from data/knowledge ---
    const knowledgeDir = path.join(process.cwd(), 'data', 'knowledge');
    if (fs.existsSync(knowledgeDir)) {
        console.log(`Scanning ${knowledgeDir} for files...`);
        const files = fs.readdirSync(knowledgeDir);

        for (const file of files) {
            const filePath = path.join(knowledgeDir, file);
            const ext = path.extname(file).toLowerCase();
            let content = '';

            try {
                if (ext === '.pdf') {
                    console.log(`Reading PDF: ${file}`);
                    const dataBuffer = fs.readFileSync(filePath);
                    const data = await pdf(dataBuffer);
                    content = data.text;
                } else if (['.txt', '.md', '.markdown'].includes(ext)) {
                    console.log(`Reading Text File: ${file}`);
                    content = fs.readFileSync(filePath, 'utf-8');
                }

                if (content.trim()) {
                    records.push({
                        id: crypto.randomUUID(), // Must be valid UUID
                        type: 'file',
                        content: `File: ${file}\n\n${content}`
                    });
                    console.log(`Added ${file} to embedding queue.`);
                }
            } catch (err) {
                console.error(`Error reading ${file}:`, err);
            }
        }
    } else {
        console.log(`Knowledge directory not found at ${knowledgeDir}. Creating it...`);
        fs.mkdirSync(knowledgeDir, { recursive: true });
    }
    // ------------------------------------------

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
