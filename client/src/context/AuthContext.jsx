// context/AuthContext.jsx — GLOBAL USER STATE
// React Context = a way to share data across all components WITHOUT prop drilling
// "Prop drilling" = passing data through 10 levels of components just to reach the one that needs it
// Context solves this: any component anywhere can read the user state

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Step 1: Create the context (an empty container)
const AuthContext = createContext();

// Step 2: Create the Provider — wraps your whole app, makes data available everywhere
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On app load: check if there's a stored token and fetch user info
  useEffect(() => {
    const token = localStorage.getItem("finflow_token");
    if (token) {
      // Set the token on all future axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Verify the token is still valid by fetching current user
      axios.get("/api/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token expired or invalid — clear everything
          localStorage.removeItem("finflow_token");
          delete axios.defaults.headers.common["Authorization"];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("finflow_token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("finflow_token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateUser = (updated) => setUser(prev => ({ ...prev, ...updated }));

  // Step 3: Provide the values — any child component can access these
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 4: Custom hook — shortcut to use the context
// Instead of: const { user } = useContext(AuthContext)
// You write:  const { user } = useAuth()
export const useAuth = () => useContext(AuthContext);
