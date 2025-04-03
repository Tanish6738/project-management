import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
    uploadAttachment,
    getTaskAttachments,
    getAttachment,
    deleteAttachment
} from '../controllers/attachment.controller.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
});

// Configure multer upload options
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
    fileFilter: (req, file, cb) => {
        // You can add file type filtering here if needed
        cb(null, true);
    }
});

const AttachmentRouter = express.Router();

// Task attachment routes
AttachmentRouter.post('/task/:taskId', auth, upload.single('file'), uploadAttachment);
AttachmentRouter.get('/task/:taskId', auth, getTaskAttachments);
AttachmentRouter.get('/:attachmentId', auth, getAttachment);
AttachmentRouter.delete('/:attachmentId', auth, deleteAttachment);

export default AttachmentRouter;