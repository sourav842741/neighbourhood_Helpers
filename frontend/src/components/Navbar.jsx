import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshakeAngle } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  return (
<nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-3 bg-white shadow-sm font-sans h-20 z-50">
      <div className="flex items-center">
        <FontAwesomeIcon icon={faHandshakeAngle} className="w-8 h-8 text-orange-500 text-2xl mr-1" />
        <span className="text-lg font-semibold text-gray-900">My Neighborhood Helper</span>
      </div>
      <div className="flex space-x-6 text-gray-900 text-sm">
        <a href="#" className="hover:text-orange-500 transition-colors duration-200 font-medium">Home</a>
        <a href="#" className="hover:text-orange-500 transition-colors duration-200 font-medium">Report Issue</a>
        <a href="#" className="hover:text-orange-500 transition-colors duration-200 font-medium">Issue Tracker</a>
        <a href="#" className="hover:text-orange-500 transition-colors duration-200 font-medium">Login/Register</a>
      </div>
    </nav>
  );
};

export default Navbar;
