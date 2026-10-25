import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../services/postService";
import type { Post } from "../types/post";

export function usePosts() {
  return useQuery<Post[], Error>({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
}
