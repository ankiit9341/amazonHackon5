import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("userA");

  useEffect(() => {
    axios.get("https://amazonhackon5.onrender.com
/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Failed to fetch users", err));
  }, []);

  const currentUser = users.find(u => u.userId === currentUserId);

  return (
    <UserContext.Provider value={{ users, currentUserId, currentUser, setCurrentUserId }}>
      {children}
    </UserContext.Provider>
  );
};
