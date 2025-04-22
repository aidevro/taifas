const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const { MONGO_URI, JWT_SECRET, AUTH_SERVICE_URL } = process.env;

// MongoDB connection
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Meeting schema
const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, unique: true },
  creator: String,
  participants: [String],
  createdAt: { type: Date, default: Date.now },
});
const Meeting = mongoose.model('Meeting', meetingSchema);

// Middleware to verify JWT
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, { token });
    req.user = response.data.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create meeting
app.post('/create-meeting', verifyToken, async (req, res) => {
  try {
    const meetingId = Math.random().toString(36).substring(2, 10);
    const meeting = new Meeting({
      meetingId,
      creator: req.user.username,
      participants: [req.user.username],
    });
    await meeting.save();
    res.json({ meetingId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Join meeting
app.post('/join-meeting', verifyToken, async (req, res) => {
  try {
    const { meetingId } = req.body;
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (!meeting.participants.includes(req.user.username)) {
      meeting.participants.push(req.user.username);
      await meeting.save();
    }
    res.json({ meetingId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join meeting' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'ok', service: 'api' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'MongoDB unavailable' });
  }
});

app.listen(3000, () => console.log('API running on port 3000'));
