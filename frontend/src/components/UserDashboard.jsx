// src/pages/UserDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMapPin, FiMessageSquare } from "react-icons/fi";
import UserNavbar from "../components/UserNavbar";
import Footer from "./Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dashboardItems = [
  {
    icon: <FiUser className="text-3xl text-orange-600 mb-3" />,
    title: "Your Profile",
    description: "View and manage your profile",
    to: "/profile",
  },
  {
    icon: <FiMapPin className="text-3xl text-orange-600 mb-3" />,
    title: "Report Issue",
    description: "Submit a new issue in your locality",
    to: "/report",
  },
  {
    icon: <FiMessageSquare className="text-3xl text-orange-600 mb-3" />,
    title: "Track Issues",
    description: "View the status of your reports",
    to: "/issues",
  },
];

const UserDashboard = () => {
  return (
    <>
      <UserNavbar />
      <div className="pt-24 px-4 min-h-screen bg-orange-50 font-sans">
        <div className="max-w-6xl mx-auto bg-white shadow-sm rounded-2xl p-8 border border-orange-200">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-orange-600">Your Dashboard</h1>
            <p className="text-gray-600 mt-2 text-sm">
              Track issues, report problems, and manage your neighborhood involvement.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item, index) => (
              <Link to={item.to} key={index}>
                <Card className="transition hover:shadow-md hover:border-orange-400 border border-orange-200 rounded-xl bg-orange-100 hover:bg-orange-200 text-center p-6">
                  <CardContent className="flex flex-col items-center justify-center">
                    {item.icon}
                    <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 text-sm">
                      Go
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;
