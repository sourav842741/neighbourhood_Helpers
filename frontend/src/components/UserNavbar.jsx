import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshakeAngle } from "@fortawesome/free-solid-svg-icons";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../authContext";
import axios from "axios";

const UserNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:8000/api/v1/users/current-user",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user", err.message);
      }
    };
    fetchUser();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-20 flex justify-between items-center px-6">
      {/* Left: Logo */}
      <Link
        to="/user/dashboard"
        className="flex items-center hover:opacity-80 transition duration-150"
      >
        <FontAwesomeIcon
          icon={faHandshakeAngle}
          className="text-orange-500 text-2xl mr-2"
        />
        <span className="text-lg font-semibold text-gray-900">
          My Neighborhood Helper
        </span>
      </Link>

      {/* Right: Links + SOS + Avatar */}
      <div className="flex items-center space-x-6 text-sm text-gray-900">
        <Link to="/report" className="hover:text-orange-500 font-medium">
          Report Issue
        </Link>
        <Link to="/issues" className="hover:text-orange-500 font-medium">
          Issue Tracker
        </Link>

        {/* SOS Icon */}
        {location.pathname !== "/sos" && (
          <Link
            to="/sos"
            className="hover:text-red-600 text-lg font-bold transition duration-150"
            title="Send SOS Alert"
          >
            <FaBell className="text-red-600 text-xl animate-bounce hover:scale-110 transition-transform" />
          </Link>
        )}

        {/* Avatar Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 font-medium hover:text-orange-500 focus:outline-none"
            >
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
              />
              <FiChevronDown className="text-gray-700" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Link
                  to="/Profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  User Profile
                </Link>

                <Link
                  to="/report"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Report Issue
                </Link>
                <Link
                  to="/issues"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Issue Tracker
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <FiLogOut /> Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default UserNavbar;
