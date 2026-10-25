CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_unique" ON "categories" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" ("slug");--> statement-breakpoint
CREATE INDEX "posts_category_id_idx" ON "posts" ("category_id");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_published_at_required", ADD CONSTRAINT "posts_published_at_required" CHECK (("status" = 'published') = ("published_at" IS NOT NULL));