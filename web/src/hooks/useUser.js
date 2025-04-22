import { useEffect, useState } from "react";

export const useUser = () => {
  const [user, setUser] = useState({ name: "", avatar: "", isGuest: true });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      const name = localStorage.getItem("name") || "Guest";
      const avatar = localStorage.getItem("avatar") || "/avatar.png";
      setUser({ name, avatar, isGuest: true });
    } else {
      fetch("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser({
            name: data.name || "User",
            avatar: data.avatarUrl || "/avatar.png",
            isGuest: false,
          });
        })
        .catch(() => {
          setUser({ name: "Guest", avatar: "/avatar.png", isGuest: true });
        });
    }
  }, []);

  return user;
};
