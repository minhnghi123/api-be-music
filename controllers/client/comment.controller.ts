import { Request, Response } from "express";
import Comment from "../../models/comment.model.js";

// Backend - Comment Controller
export const getComments = async (req: Request, res: Response) => {
  try {
    const { songId } = req.params;

    const comments = await Comment.find({
      songId: songId,
      deleted: false,
    })
      .populate({
        path: "userId",
        select: "username avatar", // Chỉ lấy username và avatar
      })
      .sort({ createdAt: -1 });

    const userId = res.locals.user?.id;

    const commentsWithLikeStatus = comments.map((comment: any) => {
      const isLiked = userId
        ? comment.likedBy.some(
            (id: string) => id.toString() === userId.toString()
          )
        : false;

      // Map username thành fullName
      const userInfo = comment.userId
        ? {
            _id: comment.userId._id,
            fullName: comment.userId.username || "Unknown User", // Dùng username
            avatar: comment.userId.avatar || null,
          }
        : {
            _id: "unknown",
            fullName: "Unknown User",
            avatar: null,
          };

      return {
        _id: comment._id,
        songId: comment.songId,
        userId: userInfo,
        content: comment.content,
        createdAt: comment.createdAt,
        likes: comment.likes,
        isLiked: isLiked,
      };
    });

    res.json({
      success: true,
      comments: commentsWithLikeStatus,
      total: commentsWithLikeStatus.length,
    });
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load comments",
      comments: [],
      total: 0,
    });
  }
};

// [POST] /comments
export const addComment = async (req: Request, res: Response) => {
  try {
    const { songId, content } = req.body;
    const userId = res.locals.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        comment: null,
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
        comment: null,
      });
    }

    const newComment = new Comment({
      songId,
      userId,
      content: content.trim(),
    });

    await newComment.save();

    const populatedComment: any = await Comment.findById(
      newComment._id
    ).populate({
      path: "userId",
      select: "username avatar",
    });

    // Map username thành fullName
    const userInfo = populatedComment.userId
      ? {
          _id: populatedComment.userId._id,
          fullName: populatedComment.userId.username || "Unknown User",
          avatar: populatedComment.userId.avatar || null,
        }
      : {
          _id: userId,
          fullName: "Unknown User",
          avatar: null,
        };

    res.status(201).json({
      success: true,
      comment: {
        _id: populatedComment._id,
        songId: populatedComment.songId,
        userId: userInfo,
        content: populatedComment.content,
        createdAt: populatedComment.createdAt,
        likes: populatedComment.likes,
        isLiked: false,
      },
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      comment: null,
    });
  }
};
// [DELETE] /comments/:commentId
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = res.locals.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const comment: any = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    comment.deleted = true;
    await comment.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};

// [POST] /comments/:commentId/like
export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = res.locals.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const comment: any = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const likedIndex = comment.likedBy.findIndex(
      (id: string) => id.toString() === userId.toString()
    );

    if (likedIndex > -1) {
      // Unlike
      comment.likedBy.splice(likedIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    await comment.save();

    res.json({
      success: true,
      message: "Comment liked/unliked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to like comment",
    });
  }
};
