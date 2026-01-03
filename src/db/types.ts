import { users, posts, courses, lessons, comments } from './schema';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// Select Types
export type User = InferSelectModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type Course = InferSelectModel<typeof courses>;
export type Lesson = InferSelectModel<typeof lessons>;
export type Comment = InferSelectModel<typeof comments>;

// Insert Types
export type NewUser = InferInsertModel<typeof users>;
export type NewPost = InferInsertModel<typeof posts>;

// This file is used to verify that types are correctly inferred from the schema.
// If this compiles, our schema definitions are consistent.
