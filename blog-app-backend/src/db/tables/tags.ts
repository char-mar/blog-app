import { pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().notNull(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
  },
  (table) => [uniqueIndex("tags_slug_unique").on(table.slug)],
);
