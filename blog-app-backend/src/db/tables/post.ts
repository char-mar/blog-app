import { sql } from "drizzle-orm";
import {
  check,
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

export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    status: postStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", {
      mode: "string",
      withTimezone: true,
    }),
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
    index("posts_feed_idx").on(table.status, table.publishedAt.desc()),
    check(
      "posts_published_at_required",
      sql`(${table.status} = 'published') = (${table.publishedAt} is not null)`,
    ),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
