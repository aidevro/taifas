const { Server } = require('socket.io');
const Redis = require('ioredis');
const axios = require('axios');
const express = require('express');

const app = express();
const { REDIS_HOST, REDIS_PORT, JWT_SECRET } = process.env;
const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });

const io = new Server(3002, { cors: { origin: '*' } });
const meetings = {};

// Health check endpoint (HTTP for Docker healthcheck)
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ status: 'ok', service: 'streaming' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

io.on('connection', (socket) => {
  socket.on('join-meeting', async ({ meetingId, username, token }) => {
    try {
      const response = await axios.post('http://auth:3001/verify', { token });
      if (!meetings[meetingId]) meetings[meetingId] = { users: [] };
      meetings[meetingId].users.push({ id: socket.id, username });
      socket.join(meetingId);
      socket.to(meetingId).emit('user-joined', { userId: socket.id });
    } catch (err) {
      socket.emit('error', 'Invalid token');
    }
  });

  socket.on('signal', async ({ userId, signal, meetingId, token }) => {
    try {
      const response = await axios.post('http://auth:3001/verify', { token });
      io.to(userId).emit('signal', { userId: socket.id, signal });
    } catch (err) {
      socket.emit('error', 'Invalid token');
    }
  });

  socket.on('leave-meeting', async ({ meetingId, username, token }) => {
    try {
      const response = await axios.post('http://auth:3001/verify', { token });
      if (meetings[meetingId]) {
        meetings[meetingId].users = meetings[meetingId].users.filter((u) => u.id !== socket.id);
        socket.to(meetingId).emit('user-left', { userId: socket.id });
        socket.leave(meetingId);
      }
    } catch (err) {
      socket.emit('error', 'Invalid token');
    }
  });

  socket.on('disconnect', () => {
    Object.keys(meetings).forEach((meetingId) => {
      const meeting = meetings[meetingId];
      const user = meeting.users.find((u) => u.id === socket.id);
      if (user) {
        meeting.users = meeting.users.filter((u) => u.id !== socket.id);
        socket.to(meetingId).emit('user-left', { userId: socket.id });
      }
    });
  });
});

app.listen(3002, () => console.log('Streaming service running on port 3002'));
