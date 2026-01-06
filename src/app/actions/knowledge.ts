'use server';

import { db } from '@/db';
import { knowledgeEntries, embeddings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { revalidatePath } from 'next/cache';
import { parseFile } from '../../lib/parsers';

export async function createKnowledgeEntry(data: { title: string; content: string; tags: string }) {
    try {
        const { title, content, tags } = data;
        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

        // 1. Insert into Knowledge Table
        const [entry] = await db.insert(knowledgeEntries).values({
            title,
            content,
            tags: tagList
        }).returning();

        // 2. Generate Embedding
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: `Title: ${title}\nContent: ${content}`,
        });

        // 3. Insert into Embeddings Table (Vector Index)
        await db.insert(embeddings).values({
            content: `[Manual Knowledge] ${title}: ${content}`,
            embedding: embedding,
            relatedId: entry.id,
            type: 'manual'
        });

        revalidatePath('/admin/knowledge');
        return { success: true, message: 'Knowledge entry created and indexed.' };

    } catch (error: any) {
        console.error('Failed to create knowledge entry:', error);
        return { success: false, message: error.message };
    }
}

export async function deleteKnowledgeEntry(id: string) {
    try {
        // 1. Delete from Knowledge Table
        await db.delete(knowledgeEntries).where(eq(knowledgeEntries.id, id));

        // 2. Delete from Embeddings Table
        // Note: We need to match relatedId AND type='manual' to be safe, 
        // though ID should be unique enough if UUID.
        await db.delete(embeddings).where(eq(embeddings.relatedId, id));

        revalidatePath('/admin/knowledge');
        return { success: true, message: 'Knowledge entry deleted.' };

    } catch (error: any) {
        console.error('Failed to delete knowledge entry:', error);
        return { success: false, message: error.message };
    }
}


export async function uploadKnowledgeFile(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const tags = formData.get('tags') as string;

        if (!file) throw new Error('No file provided');

        // 1. Parse File Content
        const text = await parseFile(file);
        if (!text || text.trim().length === 0) throw new Error('File is empty or could not be parsed');

        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
        tagList.push('file-upload');

        // 2. Chunking (Simple implementation: split by 4000 chars overlap)
        // ideally we use a real chunker, but for now this works.
        const CHUNK_SIZE = 4000;
        const chunks = [];
        for (let i = 0; i < text.length; i += CHUNK_SIZE) {
            chunks.push(text.slice(i, i + CHUNK_SIZE));
        }

        let count = 0;
        for (const chunk of chunks) {
            const chunkTitle = `${file.name} (Part ${count + 1}/${chunks.length})`;

            // 3. Create Entry & Embedding
            const [entry] = await db.insert(knowledgeEntries).values({
                title: chunkTitle,
                content: chunk,
                tags: tagList
            }).returning();

            const { embedding } = await embed({
                model: openai.embedding('text-embedding-3-small'),
                value: `Title: ${chunkTitle}\nContent: ${chunk}`,
            });

            await db.insert(embeddings).values({
                content: `[File: ${file.name}] ${chunk}`,
                embedding: embedding,
                relatedId: entry.id,
                type: 'manual'
            });
            count++;
        }

        revalidatePath('/admin/knowledge');
        return { success: true, message: `processed ${count} chunks from ${file.name}` };

    } catch (error: any) {
        console.error('Upload failed:', error);
        return { success: false, message: error.message };
    }
}

export async function getKnowledgeEntries() {
    // Optimization: Exclude 'content' which can be huge.
    return await db.select({
        id: knowledgeEntries.id,
        title: knowledgeEntries.title,
        tags: knowledgeEntries.tags,
        createdAt: knowledgeEntries.createdAt,
        // content: knowledgeEntries.content, // Omitted for performance
        // Mock content for list view compatibility
        content: knowledgeEntries.title // Just use title as placeholder content for now to satisfy type check if needed, or better, update frontend type.
    })
        .from(knowledgeEntries)
        .orderBy(knowledgeEntries.createdAt)
        .limit(100); // Safety limit
}
