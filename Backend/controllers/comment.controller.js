import Comment from '../models/comment.modal.js';
import Task from '../models/Task.modal.js';
import Project from '../models/Project.modal.js';
import AuditLog from '../models/AuditLog.modal.js';

// Create a new comment
export const createComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { content } = req.body;

        // Verify the task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to view the task/project
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is a member of the project or watching the task
        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        ) || project.owner.equals(req.user._id);
        
        const isWatcher = task.watchers.some(watcher => 
            watcher.equals(req.user._id)
        );

        if (!isMember && !isWatcher) {
            return res.status(403).json({ error: 'Not authorized to comment on this task' });
        }

        // Create and save the comment
        const comment = new Comment({
            task: taskId,
            user: req.user._id,
            content
        });

        await comment.save();

        // Add comment to task's comments array
        task.comments.push(comment._id);
        await task.save();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'create_comment',
            targetModel: 'Comment',
            targetId: comment._id,
            details: { taskId, content: content.substring(0, 50) + (content.length > 50 ? '...' : '') }
        });
        await auditLog.save();

        // Populate user data for response
        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'name email avatar');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all comments for a task
export const getTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        // Verify the task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to view the task/project
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is a member of the project or watching the task
        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        ) || project.owner.equals(req.user._id);
        
        const isWatcher = task.watchers.some(watcher => 
            watcher.equals(req.user._id)
        );

        if (!isMember && !isWatcher) {
            return res.status(403).json({ error: 'Not authorized to view comments for this task' });
        }

        // Get comments with user data
        const comments = await Comment.find({ task: taskId })
            .populate('user', 'name email avatar')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a comment
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user is the author of the comment
        if (!comment.user.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to update this comment' });
        }

        // Update the comment
        comment.content = content;
        await comment.save();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'update_comment',
            targetModel: 'Comment',
            targetId: comment._id,
            details: { taskId: comment.task, content: content.substring(0, 50) + (content.length > 50 ? '...' : '') }
        });
        await auditLog.save();

        // Populate user data for response
        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'name email avatar');

        res.json(populatedComment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user is the author of the comment
        if (!comment.user.equals(req.user._id)) {
            // If not the author, check if user is a project admin or owner
            const task = await Task.findById(comment.task);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const project = await Project.findById(task.project);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const isAdmin = project.owner.equals(req.user._id) || 
                project.members.some(member => 
                    member.user.equals(req.user._id) && 
                    member.role === 'admin'
                );

            if (!isAdmin) {
                return res.status(403).json({ error: 'Not authorized to delete this comment' });
            }
        }

        // Remove comment from task's comments array
        await Task.findByIdAndUpdate(
            comment.task,
            { $pull: { comments: commentId } }
        );

        // Delete the comment
        await comment.deleteOne();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'delete_comment',
            targetModel: 'Comment',
            targetId: commentId,
            details: { taskId: comment.task }
        });
        await auditLog.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a reply to a comment
export const addCommentReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        // Find the parent comment
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ error: 'Parent comment not found' });
        }

        // Verify the task exists
        const task = await Task.findById(parentComment.task);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to view the task/project
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is a member of the project or watching the task
        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        ) || project.owner.equals(req.user._id);
        
        const isWatcher = task.watchers.some(watcher => 
            watcher.equals(req.user._id)
        );

        if (!isMember && !isWatcher) {
            return res.status(403).json({ error: 'Not authorized to reply to this comment' });
        }

        // Create and save the reply comment
        const replyComment = new Comment({
            task: parentComment.task,
            user: req.user._id,
            content
        });

        await replyComment.save();

        // Add to parent comment's replies array
        parentComment.replies.push(replyComment._id);
        await parentComment.save();

        // Add to task's comments array
        task.comments.push(replyComment._id);
        await task.save();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'create_comment_reply',
            targetModel: 'Comment',
            targetId: replyComment._id,
            details: { 
                taskId: parentComment.task, 
                parentCommentId: parentComment._id,
                content: content.substring(0, 50) + (content.length > 50 ? '...' : '') 
            }
        });
        await auditLog.save();

        // Populate user data for response
        const populatedReply = await Comment.findById(replyComment._id)
            .populate('user', 'name email avatar');

        res.status(201).json(populatedReply);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all replies for a comment
export const getCommentReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        // Find the parent comment
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Verify the task exists and user has access
        const task = await Task.findById(parentComment.task);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check permissions
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        ) || project.owner.equals(req.user._id);
        
        const isWatcher = task.watchers.some(watcher => 
            watcher.equals(req.user._id)
        );

        if (!isMember && !isWatcher) {
            return res.status(403).json({ error: 'Not authorized to view comments' });
        }

        // If parent comment has no replies, return empty array
        if (!parentComment.replies || parentComment.replies.length === 0) {
            return res.json([]);
        }

        // Get all replies with user data
        const replies = await Comment.find({
            _id: { $in: parentComment.replies }
        })
        .populate('user', 'name email avatar')
        .sort({ createdAt: 1 });

        res.json(replies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};