import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, pgEnum, vector, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'user']);
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);

// Tables
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: roleEnum('role').default('user').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const seoMetadata = pgTable('seo_metadata', {
    id: uuid('id').primaryKey().defaultRandom(),
    canonicalUrl: text('canonical_url'),
    schemaJson: jsonb('schema_json'),
    ogImageUrl: text('og_image_url'),
});

export const posts = pgTable('posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    content: jsonb('content').notNull(),
    publishedAt: timestamp('published_at'),
    authorId: uuid('author_id').references(() => users.id).notNull(),
    seoId: uuid('seo_id').references(() => seoMetadata.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const courses = pgTable('courses', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    price: integer('price').notNull(), // cents
    status: courseStatusEnum('status').default('draft').notNull(),
    enrollmentCount: integer('enrollment_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').references(() => courses.id).notNull(),
    title: text('title').notNull(),
    videoUrl: text('video_url'),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => posts.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    isApproved: boolean('is_approved').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    seo: one(seoMetadata, {
        fields: [posts.seoId],
        references: [seoMetadata.id],
    }),
    comments: many(comments),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
    lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
    course: one(courses, {
        fields: [lessons.courseId],
        references: [courses.id],
    }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
}));
// ... existing relations ...

export const embeddings = pgTable('embeddings', {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    relatedId: uuid('related_id'), // Can reference post or course dynamically, or use separate columns
    type: text('type').notNull(), // 'post' | 'course'
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    embeddingIndex: index('embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));
