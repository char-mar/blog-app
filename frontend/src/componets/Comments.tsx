import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  commentService,
  type Comment,
  type CommentThread,
  type CreateCommentInput,
} from "../services/commentService";

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const queryClient = useQueryClient();

  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const queryKey = ["comments", postId, 1, 10];

  // Fetch paginated comments and their replies for this post.
  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => commentService.getByPost(postId, 1, 10),
    enabled: Boolean(postId),
  });

  // Create a new comment or reply.
  const createMutation = useMutation({
    mutationFn: (input: CreateCommentInput) =>
      commentService.create(postId, input),

    onSuccess: async () => {
      setBody("");
      setReplyTo(null);

      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
    },
  });

  // Delete a comment or reply.
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentService.delete(commentId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (!trimmedBody || createMutation.isPending) {
      return;
    }

    const input: CreateCommentInput = {
      body: trimmedBody,
      parentId: replyTo,
    };

    createMutation.mutate(input);
  }

  if (commentsQuery.isPending) {
    return <p>Loading comments...</p>;
  }

  if (commentsQuery.isError) {
    return (
      <p role="alert" className="text-red-600">
        {commentsQuery.error.message}
      </p>
    );
  }

  const threads: CommentThread[] = commentsQuery.data.data;

  return (
    <section className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold">
        Comments ({commentsQuery.data.pagination.total})
      </h2>

      {/* Comment and reply form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {replyTo && (
          <div className="text-sm text-gray-600">
            Replying to a comment.
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </button>
          </div>
        )}

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          maxLength={5000}
          required
          className="w-full rounded-md border p-3"
        />

        {createMutation.isError && (
          <p role="alert" className="text-red-600">
            {createMutation.error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={!body.trim() || createMutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {createMutation.isPending
            ? "Posting..."
            : replyTo
              ? "Post reply"
              : "Post comment"}
        </button>
      </form>

      {/* Comment threads */}
      <div className="space-y-6">
        {threads.map((comment: CommentThread) => (
          <article key={comment.id} className="space-y-3">
            <div className="rounded-md border p-4">
              <p className="font-medium">{comment.author.name}</p>

              <p className="mt-2 whitespace-pre-wrap">{comment.body}</p>

              <button
                type="button"
                onClick={() => {
                  setReplyTo(comment.id);
                  setBody("");
                  createMutation.reset();
                }}
                className="mt-3 text-sm text-blue-600"
              >
                Reply
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this comment?")) {
                    deleteMutation.mutate(comment.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="ml-4 text-sm text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>

            {/* Replies to this comment */}
            {comment.replies.map((reply: Comment) => (
              <div
                key={reply.id}
                className="ml-6 rounded-md border-l-2 border-gray-300 py-2 pl-4"
              >
                <p className="font-medium">{reply.author.name}</p>

                <p className="mt-1 whitespace-pre-wrap">{reply.body}</p>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this reply?")) {
                      deleteMutation.mutate(reply.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="mt-2 text-sm text-red-600 disabled:opacity-50"
                >
                  Delete reply
                </button>
              </div>
            ))}
          </article>
        ))}

        {threads.length === 0 && (
          <p className="text-gray-500">
            No comments yet. Start the discussion!
          </p>
        )}

        {deleteMutation.isError && (
          <p role="alert" className="text-red-600">
            {deleteMutation.error.message}
          </p>
        )}
      </div>
    </section>
  );
}
