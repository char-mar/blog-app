import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const postStatus = pgEnum("post_status", ["draft", "publish"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 120 }),
    postContent: text("post_content").notNull(),
    imageUrl: text("file_url"),
    status: postStatus().default("draft"),
    pusblishedAt: timestamp("pusblished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_author_id_idx").on(table.authorId),
    index("posts_status_published_idx").on(table.status, table.pusblishedAt),
  ],
);
