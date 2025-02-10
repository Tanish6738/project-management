import app from "./app.js";
import http from "http";
import connectDB from "./config/db.js";
const server = http.createServer(app);

connectDB();

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});