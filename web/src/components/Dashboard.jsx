// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    axios.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUser(res.data))
      .catch(err => {
        console.error("/auth/me failed", err);
        localStorage.removeItem("token");
        navigate("/");
      });

    axios.get("/streaming/meetings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const valid = Array.isArray(res.data) ? res.data : [];
        setMeetings(valid);
      })
      .catch(err => {
        console.error("/streaming/meetings failed", err);
        setMeetings([]);
      });
  }, []);

  const createMeeting = () => {
    const id = uuidv4().slice(0, 8);
    navigate(`/meeting/${id}`);
  };

  const joinMeeting = () => {
    if (joinId.trim()) navigate(`/meeting/${joinId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
        {user?.username === "marius" && user?.role === "admin" && (
          <button onClick={() => navigate("/maintenance")} className="text-sm text-violet-400 underline">Maintenance</button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={createMeeting} className="bg-green-600 px-4 py-2 rounded">➕ Create Meeting</button>
        <input
          className="bg-gray-800 p-2 rounded"
          placeholder="Enter Meeting ID"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
        />
        <button onClick={joinMeeting} className="bg-blue-600 px-4 py-2 rounded">🔗 Join</button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Open Meetings</h2>
        <ul className="space-y-2">
          {meetings.length === 0 && <p className="text-gray-400">No active meetings.</p>}
          {meetings.map((m, i) => (
            <li key={i} className="border border-gray-700 p-3 rounded flex justify-between items-center">
              <div>
                <p className="font-mono">ID: {m.id}</p>
                <p className="text-sm text-gray-400">Users: {Array.isArray(m.users) ? m.users.join(", ") : "n/a"}</p>
              </div>
              <button onClick={() => navigate(`/meeting/${m.id}`)} className="bg-blue-700 px-3 py-1 rounded">Join</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
