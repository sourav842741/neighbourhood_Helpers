import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshakeAngle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../authContext';

const Navbar = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const { currentUser } = useAuth();

  // Secret Admin key: Ctrl + Alt + A
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.altKey && event.code === 'KeyA') {
        setShowAdmin(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-3 bg-white shadow-sm font-sans h-20 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <FontAwesomeIcon icon={faHandshakeAngle} className="w-8 h-8 text-orange-500 text-2xl mr-1" />
        <span className="text-lg font-semibold text-gray-900">My Neighborhood Helper</span>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6 text-gray-900 text-sm items-center">
        <Link to="/" className="hover:text-orange-500 font-medium">Home</Link>
        <Link to="/report" className="hover:text-orange-500 font-medium">Report Issue</Link>
        <Link to="/issues" className="hover:text-orange-500 font-medium">Issue Tracker</Link>

        {/* Only show login/register when not logged in */}
        {!currentUser && (
          <Link to="/login" className="hover:text-orange-500 font-medium">Login/Register</Link>
        )}

        {showAdmin && (
          <Link
            to="/admin/login"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold"
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
