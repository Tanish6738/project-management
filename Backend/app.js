import express from 'express';
import UserRouter from './routes/user.routes.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/users", UserRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Backend");
});

export default app;