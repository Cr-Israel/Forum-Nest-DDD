import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";

export class CommentWithAuthorPresenter {
  static toHttp(commentWithAuthor: CommentWithAuthor) {
    return {
      commentId: commentWithAuthor.commentId.toValue(),
      authorId: commentWithAuthor.authorId.toValue(),
      authorName: commentWithAuthor.author,
      createdAt: commentWithAuthor.createdAt,
      updatedAt: commentWithAuthor.updatedAt,
    }
  }
}