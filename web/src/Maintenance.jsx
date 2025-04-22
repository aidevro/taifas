import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Maintenance() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    axios.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (res.data.username !== "marius" || res.data.role !== "admin") {
        return navigate("/");
      }
      setUser(res.data);
      fetchData();
    });
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const uRes = await axios.get("/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mRes = await axios.get("/streaming/meetings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(uRes.data);
      setMeetings(mRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/auth/admin/create", { username, password, role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername("");
      setPassword("");
      fetchData();
    } catch (err) {
      alert("Error creating user");
    }
  };

  const deleteUser = async (username) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/auth/admin/delete/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("Error deleting user");
    }
  };

  const stopMeeting = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/streaming/stop/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("Error stopping meeting");
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Maintenance</h1>
        <Link to="/dashboard" className="underline text-violet-400">⬅️ Back to Dashboard</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Users */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <ul className="mb-4">
            {users.map((u, i) => (
              <li key={i} className="flex justify-between items-center border-b py-1">
                <span>{u.username} ({u.role})</span>
                <button onClick={() => deleteUser(u.username)} className="text-red-400">🗑️</button>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <input className="w-full p-2 bg-gray-800" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="w-full p-2 bg-gray-800" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <select className="w-full p-2 bg-gray-800" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button className="bg-green-600 px-4 py-2" onClick={createUser}>Create User</button>
          </div>
        </div>

        {/* Meetings */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Meetings</h2>
          <ul>
            {meetings.map((m, i) => (
              <li key={i} className="flex justify-between items-center border-b py-1">
                <span>ID: {m.id} ({m.users.join(", ")})</span>
                <button onClick={() => stopMeeting(m.id)} className="text-red-400">🛑</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
