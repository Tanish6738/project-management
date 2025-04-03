import express from 'express';
import UserRouter from './routes/user.routes.js';
import TeamRouter from './routes/team.routes.js';
import ProjectRouter from './routes/project.routes.js';
import TaskRouter from './routes/task.routes.js';
import CommentRouter from './routes/comment.routes.js';
import AttachmentRouter from './routes/attachment.routes.js';
import TimeLogRouter from './routes/timelog.routes.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make sure uploads directory exists
import fs from 'fs';
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// API Routes
app.use("/api/users", UserRouter);
app.use("/api/teams", TeamRouter);
app.use("/api/projects", ProjectRouter);
app.use("/api/tasks", TaskRouter);
app.use("/api/comments", CommentRouter);
app.use("/api/attachments", AttachmentRouter);
app.use("/api/timelogs", TimeLogRouter);

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the Project Management Backend");
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

export default app;