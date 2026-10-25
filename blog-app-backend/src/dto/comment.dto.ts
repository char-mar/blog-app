export interface CreateCommentDto {
  body: string;
  parentId?: string;
}

export interface CommentAuthorDto {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CommentResponseDto {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthorDto;
}

export interface CommentThreadDto extends CommentResponseDto {
  replies: CommentResponseDto[];
}
