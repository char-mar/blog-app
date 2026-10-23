import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import * as schema from "../db/schema";

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;
export type Profile = InferSelectModel<typeof schema.profiles>;
export type NewProfile = InferInsertModel<typeof schema.profiles>;
export type Post = InferSelectModel<typeof schema.posts>;
export type NewPost = InferInsertModel<typeof schema.posts>;
export type Comment = InferSelectModel<typeof schema.comments>;
export type NewComment = InferInsertModel<typeof schema.comments>;
export type Tag = InferSelectModel<typeof schema.tags>;
export type NewTag = InferInsertModel<typeof schema.tags>;
export type PostTag = InferSelectModel<typeof schema.postTags>;
export type Follow = InferSelectModel<typeof schema.follows>;
export type Like = InferSelectModel<typeof schema.likes>;

export type SafeUser = Omit<User, "passwordHash">;

