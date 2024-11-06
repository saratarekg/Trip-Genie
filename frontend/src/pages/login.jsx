import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import  Cookies  from "js-cookie";
import logInPicture from '../assets/images/logInPicture.jpg';

let role = null;

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // This holds either email or username
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isValid, setIsValid] = useState(false); // Keeps track of whether the input is valid
  const navigate = useNavigate();

  const logOut = async () => {
    console.log("Logging out...");
    try {
      const response = await fetch("http://localhost:4000/auth/logout");
  
      if (response.ok) {
        Cookies.set("jwt", "");
        Cookies.set("role", "");
        Cookies.remove("jwt");
        Cookies.remove("role");
        console.log("Logged out successfully");
        window.location.reload();

      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  

  // Helper function to check if the input is a valid email
  const isValidEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  // Validate identifier (either email or username)
  const validateIdentifier = (input) => {
    if (isValidEmail(input) || input.length > 2) {
      setErrorMessage(""); // Clear any error message
      setIsValid(true);
    } else {
      setErrorMessage(
        "Please enter a valid email or username (min 3 characters)."
      );
      setIsValid(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Only proceed if input is valid
    if (!isValid) {
      setErrorMessage("Please fix the errors before submitting.");
      return;
    }
  
    // Create the request body (determine if it's an email or username)
    const requestBody = {
      username: identifier,
      password,
    };
  
    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // Send only the non-empty fields
      });
  
      if (response.ok) {
        const data = await response.json();
        role = data.role;
  
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        console.log("Login successful!");
        window.location.reload();
      } else {
        const errorData = await response.json();
        
        // Check for the specific message from the backend
        if (errorData.message === "Your account is not accepted yet") {
          setErrorMessage("Login failed. Your account is not accepted yet.");
        } else {
          setErrorMessage("Login failed. Please check your credentials.");
        }
      }
    } catch (error) {
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };
  

  return (
    
      
<div 
    className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4"
    style={{
      backgroundImage: `url(${logInPicture})`,
    }}
  >
    <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-2xl flex flex-col md:flex-row">
      <div className="w-full md:w-2/5 bg-[#B5D3D1] p-6">
        <h2 className="text-4xl font-bold text-[#1A3B47] mb-2 sticky top-0 bg-[#B5D3D1]">Welcome Back!</h2>
        <p className="text-s mb-6 text-[#1A3B47]">
        We're thrilled to see you again. Explore new updates, pick up right where you left off, and let us help make your experience even better!
        </p>
      </div>
      <div className="w-full md:w-3/5 p-6 max-h-[70vh] overflow-y-auto">
      <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700"
              >
                Email/Username
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="identifier"
                  placeholder="Email/Username"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    validateIdentifier(e.target.value); // Validate as the user types
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
            )}

            <div className="flex flex-col items-center justify-between">
              <button
                type="submit"
                className={`w-full flex justify-center mb-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5D9297] text-white hover:bg-[#1A3B47] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  !isValid ? "cursor-not-allowed hover:bg-[#5D9297]" : ""
                }`}
                disabled={!isValid} // Disable button if input is invalid
              >
                Log in
              </button>
              <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/sign-up"
                className="font-medium text-[#5D9297] hover:text-[#B5D3D1]"
              >
               Sign up now!
              </Link>
            </p>

              <button
                className="w-full flex justify-center px-4 rounded-md font-medium text-[#5D9297] hover:text-[#B5D3D1]"
                onClick={() => {
                    console.log("Logging out...");
                  logOut();
                  navigate("/");
                }}
              >
                Continue as guest
              </button>
            </div>
          </form>
      </div>
    </div>
    </div>
  );
};

export { Login as default, role };
