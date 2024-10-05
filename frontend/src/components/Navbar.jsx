"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link from React Router
import logo from "../assets/images/tgLogofinal6.png";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-sm font-medium"
  >
    {children}
  </Link>
);

export function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const role = Cookies.get("role");
  const navigate = useNavigate();

  // Define the logOut function
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
        navigate("/login"); // Redirect to login page after logout
        window.location.reload(); // Refresh the page after logout
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-[70px] bg-cover bg-center"
          style={{ background: "transparent" }}
        ></div>

        {/* Navbar Content */}
        <div className="relative bg-black bg-opacity-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <img src={logo} alt="logo" className="h-12 w-auto" />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                {role === "tour-guide" && (
                        <>
                          <NavLink to='/activity'>
                            Activities
                          </NavLink>
                          <NavLink to='/all-itineraries'>
                            Itineraries
                          </NavLink>
                        </>
                      )}
                      {role === "seller" && (
                        <>
                          
                          <NavLink to='/all-products'>
                            Products
                          </NavLink>
                        </>
                      )}
                    {role === "tourist" && (
                      <>
                        <NavLink to='/activity'>
                          Activities
                        </NavLink>
                        <NavLink to='/all-itineraries'>
                          Itineraries
                        </NavLink>
                        <NavLink to='/all-historical-places'>
                          Historical Places
                        </NavLink>
                        <NavLink to='/all-products'>
                          Products
                        </NavLink>
                      </>
                    )}
                      {role === "advertiser" && (
                        <>
                          <NavLink to='/activity'>
                            Activities
                          </NavLink>
                          
                        </>
                      )}
                    {role === "admin" && (
                      <>
                        <NavLink to='/activity'>
                          Activities
                        </NavLink>
                        <NavLink to='/all-itineraries'>
                          Itineraries
                        </NavLink>
                        <NavLink to='/all-historical-places'>
                          Historical Places
                        </NavLink>
                        <NavLink to='/all-products'>
                          Products
                        </NavLink>
                      </>
                    )}
                     {role === "tourism-governor" && (
                      <>
                        
                        <NavLink to='/all-historical-places'>
                          Historical Places
                        </NavLink>
                        
                      </>
                    )}
                    {(role === "guest" || role === undefined) && (
                      <>
                        <NavLink to='/activity'>
                          Activities
                        </NavLink>
                        <NavLink to='/all-itineraries'>
                          Itineraries
                        </NavLink>
                        <NavLink to='/all-historical-places'>
                          Historical Places
                        </NavLink>
                        <NavLink to='/all-products'>
                          Products
                        </NavLink>
                      </>
                    )}
                </div>
              </div>

              {/* Login, Sign Up */}
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {role === undefined ? (
                    <>
                      <NavLink
                        to="/login"
                        className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Login
                      </NavLink>
                      <button className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                        <NavLink to="/sign-up">Sign up</NavLink>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={logOut} // Call logOut on button click
                      className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 focus:outline-none"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-black bg-opacity-50">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {[
                  "Home",
                  "Explore",
                  "Travel",
                  "Museums",
                  "Pricing",
                  "Historical Places",
                ].map((item) => (
                  <Link
                    key={item}
                    to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-white hover:bg-white hover:bg-opacity-10 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* Login, Sign Up in Mobile View */}
              <div className="pt-4 pb-3 border-t border-white border-opacity-25">
                <div className="flex items-center px-5">
                  <Link to="/login">
                    <button className="text-white hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md text-base font-medium">
                      Login
                    </button>
                  </Link>
                  <button className="ml-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-base font-medium">
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
