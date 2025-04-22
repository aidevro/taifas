require('dotenv').config();
const { Server } = require("socket.io");
const Redis = require("ioredis");
const axios = require("axios");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const { REDIS_HOST, REDIS_PORT } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("error", (err) => console.error("❌ Redis connection error:", err));

const meetings = {};

app.get("/health", async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ status: "ok", service: "streaming" });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

io.on("connection", (socket) => {
  socket.on("join-meeting", async ({ meetingId, username, token }) => {
    try {
      await axios.post("http://auth:3001/verify", { token });

      if (!meetings[meetingId]) {
        meetings[meetingId] = { users: [], breakoutRooms: {} };
      }

      meetings[meetingId].users.push({ id: socket.id, username });
      socket.join(meetingId);
      socket.to(meetingId).emit("user-joined", { userId: socket.id });
      io.to(meetingId).emit("participants-updated", meetings[meetingId].users);
    } catch {
      socket.emit("error", "Invalid token");
    }
  });

  socket.on("signal", async ({ userId, signal, meetingId, token }) => {
    try {
      await axios.post("http://auth:3001/verify", { token });
      io.to(userId).emit("signal", { userId: socket.id, signal });
    } catch {
      socket.emit("error", "Invalid token");
    }
  });

  socket.on("chat-message", ({ meetingId, message, username }) => {
    io.to(meetingId).emit("chat-message", { username, message });
  });

  socket.on("start-screen-share", ({ meetingId }) => {
    socket.to(meetingId).emit("screen-share-started", { userId: socket.id });
  });

  socket.on("stop-screen-share", ({ meetingId }) => {
    socket.to(meetingId).emit("screen-share-stopped", { userId: socket.id });
  });

  socket.on("create-breakout-room", async ({ meetingId, roomName, token }) => {
    try {
      await axios.post("http://auth:3001/verify", { token });
      if (!meetings[meetingId].breakoutRooms[roomName]) {
        meetings[meetingId].breakoutRooms[roomName] = { users: [] };
        io.to(meetingId).emit("breakout-room-created", { roomName });
      }
    } catch {
      socket.emit("error", "Invalid token");
    }
  });

  socket.on("join-breakout-room", async ({ meetingId, roomName, token }) => {
    try {
      await axios.post("http://auth:3001/verify", { token });
      const user = meetings[meetingId]?.users.find(u => u.id === socket.id);
      if (user && meetings[meetingId]?.breakoutRooms[roomName]) {
        meetings[meetingId].breakoutRooms[roomName].users.push(user);
        socket.join(`${meetingId}:${roomName}`);
        io.to(`${meetingId}:${roomName}`).emit("breakout-room-updated", meetings[meetingId].breakoutRooms[roomName].users);
      }
    } catch {
      socket.emit("error", "Invalid token");
    }
  });

  socket.on("leave-meeting", async ({ meetingId, token }) => {
    try {
      await axios.post("http://auth:3001/verify", { token });
      if (meetings[meetingId]) {
        meetings[meetingId].users = meetings[meetingId].users.filter(u => u.id !== socket.id);
        socket.leave(meetingId);
        socket.to(meetingId).emit("user-left", { userId: socket.id });
        io.to(meetingId).emit("participants-updated", meetings[meetingId].users);
      }
    } catch {
      socket.emit("error", "Invalid token");
    }
  });

  socket.on("disconnect", () => {
    Object.keys(meetings).forEach((meetingId) => {
      const meeting = meetings[meetingId];
      const user = meeting.users.find(u => u.id === socket.id);
      if (user) {
        meeting.users = meeting.users.filter(u => u.id !== socket.id);
        socket.to(meetingId).emit("user-left", { userId: socket.id });
        io.to(meetingId).emit("participants-updated", meeting.users);
      }

      Object.entries(meeting.breakoutRooms).forEach(([roomName, room]) => {
        room.users = room.users.filter(u => u.id !== socket.id);
        io.to(`${meetingId}:${roomName}`).emit("breakout-room-updated", room.users);
      });
    });
  });
});

server.listen(3002, () => {
  console.log("🚀 Streaming service running on port 3002");
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("❌ Port 3002 is already in use. Please free the port and try again.");
  } else {
    console.error("❌ Server error:", err);
  }
  process.exit(1);
});
