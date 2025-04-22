import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

export default function Meeting() {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    // connect to signaling server
    socketRef.current = io("/", { path: "/socket.io" });

    // join room
    socketRef.current.emit("join-meeting", {
      meetingId,
      username: "user", // update to actual username if available
      token,
    });

    // handle events
    socketRef.current.on("participants-updated", (users) => {
      setParticipants(users);
    });

    socketRef.current.on("chat-message", ({ username, message }) => {
      setChat((prev) => [...prev, { username, message }]);
    });

    // get video/audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [meetingId, navigate]);

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit("chat-message", {
        meetingId,
        username: "user",
        message,
      });
      setMessage("");
    }
  };

  const toggleCamera = () => setCameraOn((prev) => !prev);
  const toggleMic = () => setMicOn((prev) => !prev);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-2xl font-bold text-violet-400 mb-4">Meeting: {meetingId}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full rounded-lg border border-gray-700"
          />

          <div className="flex gap-4 justify-center">
            <button onClick={toggleCamera} className="bg-violet-600 px-4 py-2 rounded">
              {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
            </button>
            <button onClick={toggleMic} className="bg-violet-600 px-4 py-2 rounded">
              {micOn ? "Mute" : "Unmute"}
            </button>
          </div>

          <div className="bg-gray-800 rounded p-4">
            <h2 className="text-lg font-semibold mb-2">Participants</h2>
            <ul className="space-y-1 text-sm">
              {participants.map((user) => (
                <li key={user.id} className="text-violet-300">
                  {user.username || "User"}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-1/3 bg-gray-800 rounded p-4 space-y-4">
          <h2 className="text-lg font-semibold">Chat</h2>
          <div className="h-64 overflow-y-auto space-y-2">
            {chat.map((msg, idx) => (
              <div key={idx}>
                <span className="font-bold text-violet-300">{msg.username}:</span>{" "}
                {msg.message}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 px-2 py-1 rounded bg-gray-700"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="bg-violet-600 px-4 py-1 rounded">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
