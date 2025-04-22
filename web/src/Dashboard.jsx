import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.username) setUsername(userData.username);
    if (userData.photo) setPhoto(userData.photo);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNameChange = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.username = username;
    localStorage.setItem("user", JSON.stringify(user));
    alert("Name updated!");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.photo = reader.result;
      localStorage.setItem("user", JSON.stringify(user));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMeeting = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/create-meeting", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.meetingId) {
      navigate(`/meeting/${data.meetingId}`);
    } else {
      alert("Failed to create meeting");
    }
  };

  const handleJoinMeeting = () => {
    if (meetingId.trim()) {
      navigate(`/meeting/${meetingId}`);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-900 text-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-xl mx-auto mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-violet-400">Dashboard</h2>
          <Button variant="ghost" onClick={handleLogout} className="text-red-400">
            Logout
          </Button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          {photo ? (
            <img src={photo} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-400">
              No Photo
            </div>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        <div className="mt-6 space-y-3">
          <label className="block text-sm text-gray-300">Your Name</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button onClick={handleNameChange} className="bg-violet-500 hover:bg-violet-600">
            Update Name
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-semibold text-violet-400">Meeting Controls</h3>
          <Button onClick={handleCreateMeeting} className="w-full bg-violet-500 hover:bg-violet-600">
            Create Meeting
          </Button>
          <Input
            placeholder="Enter meeting ID to join"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
          <Button onClick={handleJoinMeeting} variant="outline" className="w-full border-violet-400 text-violet-400 hover:bg-violet-900">
            Join Meeting
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
