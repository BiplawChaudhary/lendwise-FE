import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, try to restore session from sessionStorage
    const token = sessionStorage.getItem("authToken");
    const userEmail = sessionStorage.getItem("userEmail");
    const role = sessionStorage.getItem("role");
    const userProfilePictureUrl = sessionStorage.getItem("userProfilePictureUrl");

    if (token && userEmail && role) {
      setUser({ authToken: token, userEmail, role, userProfilePictureUrl });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    // data = apiResponseData.data from login response
    const { authToken, userEmail, userProfilePictureUrl, role , kycStatus} = data;
    sessionStorage.setItem("kycStatus", kycStatus);
    sessionStorage.setItem("authToken", authToken);
    sessionStorage.setItem("userEmail", userEmail);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("userProfilePictureUrl", userProfilePictureUrl || "");

    setUser({ authToken, userEmail, role, userProfilePictureUrl: userProfilePictureUrl || "" });
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}