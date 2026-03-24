require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const postRoutes = require("./routes/postRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/posts", postRoutes);

// export io for scheduler
module.exports.io = io;

io.on("connection", (socket) => {
  console.log("Frontend connected to WebSocket");
});

// Load scheduler directly after DB so it starts running
require("./services/scheduler");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
