// src/components/Meeting.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("/socket.io", { path: "/socket.io", transports: ["websocket"] });

export default function Meeting() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [participants, setParticipants] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  const videoRefs = useRef({});
  const localVideoRef = useRef(null);
  const token = localStorage.getItem("token") || "";
  const username = localStorage.getItem("name") || "Guest";

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Your browser does not support video/audio.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        socket.emit("join-meeting", { meetingId: id, username, token });
      })
      .catch((err) => {
        console.error("getUserMedia error", err);
        alert("Permission denied or no media devices found.");
      });

    socket.on("participants-updated", (users) => {
      setParticipants(users.filter((u) => u.id !== socket.id));
    });

    socket.on("user-joined", ({ userId }) => {
      if (!stream) return;
      const peer = new Peer({ initiator: true, trickle: false, stream });
      peer.on("signal", (signal) => {
        socket.emit("signal", { signal, userId, meetingId: id, token });
      });
      peer.on("stream", (remoteStream) => {
        if (videoRefs.current[userId]) {
          videoRefs.current[userId].srcObject = remoteStream;
        }
      });
      setPeers((prev) => ({ ...prev, [userId]: peer }));
    });

    socket.on("signal", ({ userId, signal }) => {
      if (!peers[userId] && stream) {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on("signal", (s) => {
          socket.emit("signal", { signal: s, userId, meetingId: id, token });
        });
        peer.on("stream", (remoteStream) => {
          if (videoRefs.current[userId]) {
            videoRefs.current[userId].srcObject = remoteStream;
          }
        });
        peer.signal(signal);
        setPeers((prev) => ({ ...prev, [userId]: peer }));
      } else if (peers[userId]) {
        peers[userId].signal(signal);
      }
    });

    socket.on("user-left", ({ userId }) => {
      if (peers[userId]) {
        peers[userId].destroy();
        const updated = { ...peers };
        delete updated[userId];
        setPeers(updated);
      }
    });

    socket.on("chat-message", ({ username, message }) => {
      setChat((prev) => [...prev, { sender: username, text: message }]);
    });

    return () => {
      socket.emit("leave-meeting", { meetingId: id, token });
      socket.disconnect();
      Object.values(peers).forEach((p) => p.destroy());
    };
  }, [stream]);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit("chat-message", { meetingId: id, message, username });
      setChat((prev) => [...prev, { sender: "You", text: message }]);
      setMessage("");
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = muted));
      setMuted(!muted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !cameraOn));
      setCameraOn(!cameraOn);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      Object.values(peers).forEach((peer) => {
        const sender = peer._pc.getSenders().find((s) => s.track.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });
      screenTrack.onended = () => toggleCamera();
    } catch (err) {
      console.error("Screen sharing failed", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <h2 className="text-xl font-bold p-4">Meeting ID: {id}</h2>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-auto">
          <div className="relative border rounded bg-black aspect-video">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 bg-black/60 px-2 py-1 text-xs rounded">You</span>
          </div>

          {participants.map((p) => (
            <div key={p.id} className="relative border rounded bg-black aspect-video">
              <video
                ref={(el) => (videoRefs.current[p.id] = el)}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 bg-black/60 px-2 py-1 text-xs rounded">{p.username}</span>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-700 p-4 flex flex-col bg-gray-800">
          <h3 className="font-bold mb-2">Chat</h3>
          <div className="flex-1 overflow-auto border rounded p-2 bg-gray-900 mb-2 text-sm">
            {chat.map((msg, i) => (
              <div key={i}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 rounded bg-gray-700 text-white"
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSend}>📨</button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 p-4 border-t border-gray-800 bg-gray-900">
        <button onClick={toggleMute}>{muted ? "🔇 Unmute" : "🎤 Mute"}</button>
        <button onClick={toggleCamera}>{cameraOn ? "🎥 Stop Video" : "📷 Start Video"}</button>
        <button onClick={startScreenShare}>🖥️ Share Screen</button>
        <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700" onClick={() => navigate("/")}>🚪 Leave</button>
      </div>
    </div>
  );
}
