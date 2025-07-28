import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";

const ProfileDropdown = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-500"
      >
        <FiUser className="text-xl" />
        <span>Profile</span>
        <FiChevronDown />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <Link
            to="/report"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
            onClick={() => setOpen(false)}
          >
            Report Issue
          </Link>
          <Link
            to="/issues"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100"
            onClick={() => setOpen(false)}
          >
            Issue Tracker
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
