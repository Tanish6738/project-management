import Attachment from '../models/Attachment.modal.js';
import Task from '../models/Task.modal.js';
import Project from '../models/Project.modal.js';
import AuditLog from '../models/AuditLog.modal.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Create a new attachment
export const uploadAttachment = async (req, res) => {
    try {
        const { taskId } = req.params;
        
        // Verify the task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to add attachments
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isMember = project.members.some(member => 
            member.user.equals(req.user._id) && 
            member.permissions.canEditTasks
        ) || project.owner.equals(req.user._id);

        if (!isMember) {
            return res.status(403).json({ error: 'Not authorized to add attachments' });
        }

        // Handle file upload - this assumes you are using a middleware like multer
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create and save the attachment
        const attachment = new Attachment({
            task: taskId,
            filename: req.file.originalname,
            filepath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: req.user._id
        });

        await attachment.save();

        // Add attachment to task's attachments array
        task.attachments.push(attachment._id);
        await task.save();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'upload_attachment',
            targetModel: 'Attachment',
            targetId: attachment._id,
            details: { taskId, filename: req.file.originalname, fileType: req.file.mimetype }
        });
        await auditLog.save();

        res.status(201).json(attachment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all attachments for a task
export const getTaskAttachments = async (req, res) => {
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

        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        ) || project.owner.equals(req.user._id);
        
        const isWatcher = task.watchers.some(watcher => 
            watcher.equals(req.user._id)
        );

        if (!isMember && !isWatcher) {
            return res.status(403).json({ error: 'Not authorized to view attachments' });
        }

        // Get attachments with uploader data
        const attachments = await Attachment.find({ task: taskId })
            .populate('uploadedBy', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json(attachments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific attachment
export const getAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        
        // Find the attachment
        const attachment = await Attachment.findById(attachmentId);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }

        // Verify the task exists
        const task = await Task.findById(attachment.task);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to view the task/project
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
            return res.status(403).json({ error: 'Not authorized to view this attachment' });
        }

        // Check if file exists on the filesystem
        if (!fs.existsSync(attachment.filepath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        // Return the file
        res.download(attachment.filepath, attachment.filename);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an attachment
export const deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        
        // Find the attachment
        const attachment = await Attachment.findById(attachmentId);
        if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
        }

        // Verify the task exists
        const task = await Task.findById(attachment.task);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has permission to delete this attachment
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // User can delete if they are the uploader, project owner, or project admin
        const isUploader = attachment.uploadedBy.equals(req.user._id);
        const isOwner = project.owner.equals(req.user._id);
        const isAdmin = project.members.some(member => 
            member.user.equals(req.user._id) && 
            member.role === 'admin'
        );

        if (!isUploader && !isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this attachment' });
        }

        // Delete the file from filesystem
        if (fs.existsSync(attachment.filepath)) {
            fs.unlinkSync(attachment.filepath);
        }

        // Remove attachment from task's attachments array
        await Task.findByIdAndUpdate(
            attachment.task,
            { $pull: { attachments: attachmentId } }
        );

        // Delete the attachment document
        await attachment.deleteOne();

        // Log the action
        const auditLog = new AuditLog({
            user: req.user._id,
            action: 'delete_attachment',
            targetModel: 'Attachment',
            targetId: attachmentId,
            details: { taskId: attachment.task, filename: attachment.filename }
        });
        await auditLog.save();

        res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};