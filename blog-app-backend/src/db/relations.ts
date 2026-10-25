import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    profile: r.one.profiles({
      from: r.users.id,
      to: r.profiles.userId,
    }),

    posts: r.many.posts({
      from: r.users.id,
      to: r.posts.authorId,
    }),

    comments: r.many.comments({
      from: r.users.id,
      to: r.comments.authorId,
    }),

    likes: r.many.likes({
      from: r.users.id,
      to: r.likes.userId,
    }),

    followers: r.many.follows({
      from: r.users.id,
      to: r.follows.followingId,
    }),

    followings: r.many.follows({
      from: r.users.id,
      to: r.follows.followerId,
    }),
  },

  profiles: {
    user: r.one.users({
      from: r.profiles.userId,
      to: r.users.id,
    }),
  },

  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),

    category: r.one.categories({
      from: r.posts.categoryId,
      to: r.categories.id,
    }),

    comments: r.many.comments({
      from: r.posts.id,
      to: r.comments.postId,
    }),

    likes: r.many.likes({
      from: r.posts.id,
      to: r.likes.postId,
    }),

    tags: r.many.tags({
      from: r.posts.id.through(r.postTags.postId),
      to: r.tags.id.through(r.postTags.tagId),
    }),
  },

  categories: {
    posts: r.many.posts({
      from: r.categories.id,
      to: r.posts.categoryId,
    }),
  },

  comments: {
    post: r.one.posts({
      from: r.comments.postId,
      to: r.posts.id,
    }),

    author: r.one.users({
      from: r.comments.authorId,
      to: r.users.id,
    }),

    parent: r.one.comments({
      from: r.comments.parentId,
      to: r.comments.id,
      alias: "parent",
    }),

    replies: r.many.comments({
      from: r.comments.id,
      to: r.comments.parentId,
      alias: "replies",
    }),
  },

  tags: {
    posts: r.many.posts({
      from: r.tags.id.through(r.postTags.tagId),
      to: r.posts.id.through(r.postTags.postId),
    }),
  },

  likes: {
    user: r.one.users({
      from: r.likes.userId,
      to: r.users.id,
    }),

    post: r.one.posts({
      from: r.likes.postId,
      to: r.posts.id,
    }),
  },

  follows: {
    follower: r.one.users({
      from: r.follows.followerId,
      to: r.users.id,
      alias: "follower",
    }),

    following: r.one.users({
      from: r.follows.followingId,
      to: r.users.id,
      alias: "following",
    }),
  },
}));
