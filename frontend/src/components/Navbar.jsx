import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/TGlogo.svg";
import {
  Menu,
  X,
  User,
  HistoryIcon,
  Calendar,
  AlertTriangle,
  LogOut,
} from "lucide-react";

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-white hover:bg-white/10 px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium"
  >
    {children}
  </Link>
);

export function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const role = Cookies.get("role");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    const handleScroll = () => {
      const heroHeight =
        document.querySelector(".hero-section")?.offsetHeight || 0;
      setIsScrolled(window.scrollY > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  const logOut = async () => {
    console.log("Logging out...");
    try {
      const response = await fetch("http://localhost:4000/auth/logout");

      if (response.ok) {
        Cookies.remove("jwt");
        Cookies.remove("role");
        console.log("Logged out successfully");
        navigate("/login");
        window.location.reload();
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black/50" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 ml-8">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="logo" className="h-10 w-auto" />
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:block" style={{ marginRight: 30 }}>
            <div className="inline-flex items-center border border-white/20 rounded-full px-2 py-1">
              {role === "tour-guide" && (
                <>
                  <NavLink to="/activity">Activities</NavLink>
                  <NavLink to="/all-itineraries">Itineraries</NavLink>
                  <NavLink to="/tour-guide-profile">Profile</NavLink>
                </>
              )}
              {role === "seller" && (
                <>
                  <NavLink to="/all-products">Products</NavLink>
                  <NavLink to="/seller-profile">Profile</NavLink>
                </>
              )}
              {role === "tourist" && (
                <>
                  <NavLink to="/activity">Activities</NavLink>
                  <NavLink to="/all-itineraries">Itineraries</NavLink>
                  <NavLink to="/all-historical-places">
                    Historical Places
                  </NavLink>
                  <NavLink to="/all-products">Products</NavLink>
                </>
              )}
              {role === "advertiser" && (
                <>
                  <NavLink to="/activity">Activities</NavLink>
                  <NavLink to="/advertiser-profile">Profile</NavLink>
                </>
              )}
              {role === "admin" && (
                <div className="flex justify-between items-center">
                  {/* Admin-specific navigation items can be added here */}
                </div>
              )}
              {role === "tourism-governor" && (
                <>
                  <NavLink to="/all-historical-places">
                    Historical Places
                  </NavLink>
                  <NavLink to="/create-historical-tag">Historical tag</NavLink>
                </>
              )}
              {(role === "guest" || role === undefined) && (
                <>
                  <NavLink to="/activity">Activities</NavLink>
                  <NavLink to="/all-itineraries">Itineraries</NavLink>
                  <NavLink to="/all-historical-places">
                    Historical Places
                  </NavLink>
                  <NavLink to="/all-products">Products</NavLink>
                </>
              )}
            </div>
          </div>

          {/* Login, Sign Up, and Menu Button */}
          <div className="hidden md:flex items-center">
            {role === undefined ? (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/sign-up"
                  className="ml-3 bg-white text-black hover:bg-white/90 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-full text-white hover:bg-white/10 focus:outline-none transition-colors duration-200"
                >
                  <Menu className="h-6 w-6" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 rounded-2xl border border-white/20 shadow-lg py-1">
                    <Link
                      to="/account/info"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Settings & Privacy
                    </Link>
                    {role === "tourist" && (
                      <>
                        <Link
                          to="/account/history"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                        >
                          <HistoryIcon className="mr-2 h-4 w-4" />
                          Give Feedback
                        </Link>
                        <Link
                          to="/account/upcoming"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/account/complain"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Help & Support
                        </Link>
                      </>
                    )}
                    <button
                      onClick={logOut}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-white hover:bg-white/10 focus:outline-none transition-colors duration-200"
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
        <div className="md:hidden bg-black/90 mt-2 mx-4 rounded-2xl border border-white/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {role === "tour-guide" && (
              <>
                <NavLink to="/activity">Activities</NavLink>
                <NavLink to="/all-itineraries">Itineraries</NavLink>
                <NavLink to="/tour-guide-profile">Profile</NavLink>
              </>
            )}
            {role === "seller" && (
              <>
                <NavLink to="/all-products">Products</NavLink>
                <NavLink to="/seller-profile">Profile</NavLink>
              </>
            )}
            {role === "tourist" && (
              <>
                <NavLink to="/activity">Activities</NavLink>
                <NavLink to="/all-itineraries">Itineraries</NavLink>
                <NavLink to="/all-historical-places">Historical Places</NavLink>
                <NavLink to="/all-products">Products</NavLink>
              </>
            )}
            {role === "advertiser" && (
              <>
                <NavLink to="/activity">Activities</NavLink>
                <NavLink to="/advertiser-profile">Profile</NavLink>
              </>
            )}
            {role === "tourism-governor" && (
              <>
                <NavLink to="/all-historical-places">Historical Places</NavLink>
                <NavLink to="/create-historical-tag">Historical tag</NavLink>
              </>
            )}
            {(role === "guest" || role === undefined) && (
              <>
                <NavLink to="/activity">Activities</NavLink>
                <NavLink to="/all-itineraries">Itineraries</NavLink>
                <NavLink to="/all-historical-places">Historical Places</NavLink>
                <NavLink to="/all-products">Products</NavLink>
              </>
            )}
            {role !== "guest" && role !== undefined && (
              <>
                <Link
                  to="/account/info"
                  className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  Settings & Privacy
                </Link>
                {role === "tourist" && (
                  <>
                    <Link
                      to="/account/history"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                    >
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      Give Feedback
                    </Link>
                    <Link
                      to="/account/upcoming"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/account/complain"
                      className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Help & Support
                    </Link>
                  </>
                )}
                <button
                  onClick={logOut}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </button>
              </>
            )}
          </div>

          {/* Login, Sign Up in Mobile View */}
          {role === undefined && (
            <div className="pt-4 pb-3 border-t border-white/20">
              <div className="flex items-center px-5">
                <Link to="/login">
                  <button className="text-white hover:bg-white/10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                    Login
                  </button>
                </Link>
                <Link to="/sign-up">
                  <button className="ml-3 bg-white text-black hover:bg-white/90 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                    Sign up
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
