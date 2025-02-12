import express from 'express';
import UserRouter from './routes/user.routes.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import TeamRouter from './routes/team.routes.js';
import ProjectRouter from './routes/project.routes.js';  // Add this import
import TaskRouter from './routes/task.routes.js';
const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/users", UserRouter);
app.use("/api/teams", TeamRouter);
app.use("/api/projects", ProjectRouter);  // Add this line
app.use("/api/tasks", TaskRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Backend");
});

export default app;