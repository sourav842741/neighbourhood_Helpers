// src/pages/UserDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMapPin, FiMessageSquare } from 'react-icons/fi';
import UserNavbar from '../components/UserNavbar';
import Footer from './Footer';

const UserDashboard = () => {
  return (
    <>
      <UserNavbar />
      <div className="pt-24 px-6 min-h-screen bg-orange-50 font-sans ">
        <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8 border border-orange-200">
          {/* Welcome Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-orange-600">Welcome to Your Dashboard</h1>
            <p className="text-gray-600 mt-2">Track issues, report problems, and manage your neighborhood involvement.</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Profile */}
            <Link to="/profile" className="bg-orange-100 hover:bg-orange-200 transition rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <FiUser className="text-4xl text-orange-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Your Profile</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage your profile</p>
            </Link>

            {/* Report Issue */}
            <Link to="/report" className="bg-orange-100 hover:bg-orange-200 transition rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <FiMapPin className="text-4xl text-orange-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Report Issue</h3>
              <p className="text-sm text-gray-600 mt-1">Submit a new issue in your locality</p>
            </Link>

            {/* Issue Tracker */}
            <Link to="/issues" className="bg-orange-100 hover:bg-orange-200 transition rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
              <FiMessageSquare className="text-4xl text-orange-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Track Issues</h3>
              <p className="text-sm text-gray-600 mt-1">View the status of your reports</p>
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default UserDashboard;
