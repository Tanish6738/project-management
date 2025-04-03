import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
    createComment,
    getTaskComments,
    updateComment,
    deleteComment,
    addCommentReply,
    getCommentReplies
} from '../controllers/comment.controller.js';

const CommentRouter = express.Router();

// Task comment routes
CommentRouter.post('/task/:taskId', auth, createComment);
CommentRouter.get('/task/:taskId', auth, getTaskComments);

// Comment operations
CommentRouter.put('/:commentId', auth, updateComment);
CommentRouter.delete('/:commentId', auth, deleteComment);

// Comment reply operations
CommentRouter.post('/:commentId/replies', auth, addCommentReply);
CommentRouter.get('/:commentId/replies', auth, getCommentReplies);

export default CommentRouter;