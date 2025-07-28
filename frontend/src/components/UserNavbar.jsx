// src/components/UserNavbar.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshakeAngle } from '@fortawesome/free-solid-svg-icons';
import { FiUser, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../authContext';

const UserNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-20 flex justify-between items-center px-6">
      {/* Left: Logo */}
      <div className="flex items-center">
        <FontAwesomeIcon icon={faHandshakeAngle} className="text-orange-500 text-2xl mr-2" />
        <span className="text-lg font-semibold text-gray-900">My Neighborhood Helper</span>
      </div>

      {/* Right: Nav Links + Profile */}
      <div className="flex items-center space-x-6 text-sm text-gray-900">
        <Link to="/report" className="hover:text-orange-500 font-medium">Report Issue</Link>
        <Link to="/issues" className="hover:text-orange-500 font-medium">Issue Tracker</Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 font-medium hover:text-orange-500"
          >
            <FiUser className="text-xl" />
            <span>Profile</span>
            <FiChevronDown />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50">
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
      </div>
    </nav>
  );
};

export default UserNavbar;
