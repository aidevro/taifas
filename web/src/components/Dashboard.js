import React, { useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [meetingId, setMeetingId] = useState("");
    const [error, setError] = useState("");

    const handleCreateMeeting = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://158.179.43.153/api/meetings",
                { title: "New Meeting" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.location.href = `/meeting/${response.data.meetingId}`;
        } catch (err) {
            setError("Failed to create meeting");
        }
    };

    const handleJoinMeeting = () => {
        if (meetingId) {
            window.location.href = `/meeting/${meetingId}`;
        } else {
            setError("Enter a meeting ID");
        }
    };

    return (
        <div className="min-h-screen bg-zoomGray p-8">
            <div className="max-w-4xl mx-auto bg-zoomWhite p-6 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-zoomBlue mb-6">Taifas Dashboard</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={handleCreateMeeting}
                        className="bg-zoomBlue text-zoomWhite px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Create Meeting
                    </button>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}
                            placeholder="Enter Meeting ID"
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zoomBlue"
                        />
                        <button
                            onClick={handleJoinMeeting}
                            className="bg-zoomBlue text-zoomWhite px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Join Meeting
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
