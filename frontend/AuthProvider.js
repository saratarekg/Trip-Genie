import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie"; // Import the js-cookie library

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState(Cookies.get("token")); // Use Cookies.get() to retrieve the token

  // Function to set the authentication token
  const setToken = (newToken) => {
    setToken_(newToken);
    if (newToken) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + newToken;
      Cookies.set("token", newToken); // Use Cookies.set() to store the token
    } else {
      delete axios.defaults.headers.common["Authorization"];
      Cookies.remove("token"); // Use Cookies.remove() to remove the token
    }
  };

  useEffect(() => {
    // No need to check for token changes here; useEffect will handle it
  }, []);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
