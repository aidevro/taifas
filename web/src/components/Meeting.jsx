import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const Meeting = ({ match }) => {
    const { id: meetingId } = match.params;
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [breakoutRooms, setBreakoutRooms] = useState([]);
    const [error, setError] = useState("");
    const socketRef = useRef();
    const localVideoRef = useRef();
    const remoteVideosRef = useRef({});

    useEffect(() => {
        socketRef.current = io("http://158.179.43.153", { path: "/socket.io" });
        const token = localStorage.getItem("token");
        const username = "user"; // Replace with actual username from auth

        socketRef.current.emit("join-meeting", { meetingId, username, token });

        socketRef.current.on("user-joined", ({ userId }) => {
            setParticipants((prev) => [...prev, { id: userId, username: "User" + userId }]);
        });

        socketRef.current.on("participants-updated", (users) => {
            setParticipants(users);
        });

        socketRef.current.on("chat-message", ({ username, message }) => {
            setMessages((prev) => [...prev, { username, message }]);
        });

        socketRef.current.on("breakout-room-created", ({ roomName }) => {
            setBreakoutRooms((prev) => [...prev, roomName]);
        });

        socketRef.current.on("breakout-room-updated", (users) => {
            setParticipants(users);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localVideoRef.current.srcObject = stream;
        });

        return () => socketRef.current.disconnect();
    }, [meetingId]);

    const sendMessage = () => {
        if (message) {
            socketRef.current.emit("chat-message", { meetingId, message, username: "user" });
            setMessage("");
        }
    };

    const createBreakoutRoom = () => {
        const roomName = `Room${breakoutRooms.length + 1}`;
        socketRef.current.emit("create-breakout-room", { meetingId, roomName, token: localStorage.getItem("token") });
    };

    const joinBreakoutRoom = (roomName) => {
        socketRef.current.emit("join-breakout-room", { meetingId, roomName, token: localStorage.getItem("token") });
    };

    return (
        <div className="min-h-screen bg-zoomGray p-8">
            <div className="max-w-7xl mx-auto bg-zoomWhite p-6 rounded-lg shadow-lg flex">
                <div className="w-3/4">
                    <h2 className="text-2xl font-bold text-zoomBlue mb-4">Meeting: {meetingId}</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <video ref={localVideoRef} autoPlay muted className="w-full rounded-lg border"></video>
                        {participants.map((p) => (
                            <video key={p.id} ref={(el) => (remoteVideosRef.current[p.id] = el)} autoPlay className="w-full rounded-lg border"></video>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <button className="bg-zoomBlue text-zoomWhite px-4 py-2 rounded-lg hover:bg-blue-700">Toggle Video</button>
                        <button className="bg-zoomBlue text-zoomWhite px-4 py-2 rounded-lg hover:bg-blue-700">Toggle Audio</button>
                        <button className="bg-zoomBlue text-zoomWhite px-4 py-2 rounded-lg hover:bg-blue-700">Share Screen</button>
                        <button onClick={createBreakoutRoom} className="bg-zoomBlue text-zoomWhite px-4 py-2 rounded-lg hover:bg-blue-700">Create Breakout Room</button>
                    </div>
                </div>
                <div className="w-1/4 pl-4">
                    <h3 className="text-lg font-bold text-zoomBlue mb-2">Participants</h3>
                    <ul className="mb-4">
                        {participants.map((p) => (
                            <li key={p.id} className="text-gray-700">{p.username}</li>
                        ))}
                    </ul>
                    <h3 className="text-lg font-bold text-zoomBlue mb-2">Breakout Rooms</h3>
                    <ul className="mb-4">
                        {breakoutRooms.map((room) => (
                            <li key={room} className="text-gray-700">
                                {room}
                                <button onClick={() => joinBreakoutRoom(room)} className="ml-2 text-zoomBlue hover:underline">Join</button>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-lg font-bold text-zoomBlue mb-2">Chat</h3>
                    <div className="h-48 overflow-y-auto mb-2 p-2 border rounded-lg">
                        {messages.map((m, i) => (
                            <p key={i} className="text-gray-700">{m.username}: {m.message}</p>
                        ))}
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zoomBlue"
                        />
                        <button onClick={sendMessage} className="ml-2 bg-zoomBlue text-zoomWhite px-4 py-2 rounded-lg hover:bg-blue-700">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Meeting;
