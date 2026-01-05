import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
}

// Ensure URL is clean (just in case)
const connectionString = process.env.DATABASE_URL.replace(/['"]/g, '');

const sql = neon(connectionString);

async function main() {
    console.log('Connecting to DB...');
    try {
        // Test connection
        const res = await sql`SELECT 1 as connected`;
        console.log('Connected:', res);

        console.log('Enabling vector extension...');
        await sql`CREATE EXTENSION IF NOT EXISTS vector`;
        console.log('✅ Vector extension enabled successfully.');
    } catch (error) {
        console.error('❌ Failed to enable vector extension:', error);
        // Log details
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
    }
}

main();
