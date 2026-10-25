export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  imageUrl?: string | null;
  status?: "draft" | "published";
  publishedAt?: string | null;
  author?: {
    id?: string;
    name?: string;
  } | null;
}
