import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshakeAngle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import {
  IconUsers,
  IconFileText,
  IconSettings,
  IconChartBar,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@/components/ui/table";

const dashboardCards = [
  {
    title: "Users",
    value: 324,
    icon: <IconUsers className="text-orange-500 w-6 h-6" />,
  },
  {
    title: "Reports",
    value: 67,
    icon: <IconFileText className="text-orange-500 w-6 h-6" />,
  },
  {
    title: "Settings",
    value: "Active",
    icon: <IconSettings className="text-orange-500 w-6 h-6" />,
  },
  {
    title: "Analytics",
    value: "Up 12%",
    icon: <IconChartBar className="text-orange-500 w-6 h-6" />,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout route
      await axios.post(
        "http://localhost:8000/api/v1/admin/logout",
        {},
        { withCredentials: true }
      );

      // Navigate to home
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 font-sans">
      {/* TOP NAVBAR */}
      <nav className="bg-white shadow-md fixed top-0 w-full z-10 border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Logo & Name */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faHandshakeAngle}
              className="w-6 h-6 text-orange-600"
            />
            <span className="text-xl font-bold text-orange-600">
              Neighborhood Helper
            </span>
          </div>

          {/* Right: Profile + Logout */}
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button
                variant="outline"
                className="text-orange-600 border-orange-300 hover:bg-orange-100"
              >
                Profile
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Page content padding */}
      <div className="pt-24 px-6">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-orange-600">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back, Admin!</p>
        </header>

        {/* DASHBOARD CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, i) => (
            <Card
              key={i}
              className="hover:shadow-xl transition-shadow bg-orange-100 border border-orange-200"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {card.title}
                </CardTitle>
                <div className="bg-white p-2 rounded-full">{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* USER MANAGEMENT TABLE */}
        <section className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-600 mb-4">
            User Management
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "John Doe", email: "john@example.com", role: "Admin" },
                {
                  name: "Jane Smith",
                  email: "jane@example.com",
                  role: "Editor",
                },
              ].map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <IconPencil className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive">
                      <IconTrash className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* SETTINGS FORM */}
        <section className="bg-white rounded-2xl shadow-md p-6 border border-orange-200">
          <h2 className="text-xl font-semibold text-orange-600 mb-4">
            Settings
          </h2>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteTitle">Site Title</Label>
              <Input
                id="siteTitle"
                defaultValue="Admin Portal"
                className="focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                defaultValue="admin@example.com"
                className="focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Save Changes
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
