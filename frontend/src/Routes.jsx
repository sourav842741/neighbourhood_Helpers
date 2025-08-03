import React, { useEffect, useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import axios from "axios";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerify from "./pages/OTPVerify";

// Admin Pages
import AdminLogin from "./components/AdminLogin";
import AdminRegister from "./components/AdminRegister";
import AdminDashboard from "./components/AdminDashboard";

// Auth Context
import { useAuth } from "./authContext";
import UserDashboard from "./components/UserDashboard";
import UserProfile from "./components/UserProfile";
import ReportIssue from "./pages/ReportIssue";
import SOSForm from "./components/SOSForm";
import IssueTracker from "./components/IssueTracker";
import AdminEvents from "./components/AdminEvents";
import AdminEventDetail from "./components/AdminEventDetail";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [adminAuthenticated, setAdminAuthenticated] = useState(null); // null = checking
useEffect(() => {
  const userIdFromStorage = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");
  const currentPath = window.location.pathname;

  const publicPaths = [
    "/", "/login", "/register", "/verify-otp",
    "/admin/login", "/admin/register"
  ];
  const isAdminPath = currentPath.startsWith("/admin");

  if (userIdFromStorage && !currentUser) {
    setCurrentUser(userIdFromStorage);
  }

  // Admin check
  const checkAdminAuth = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/admin/me", {
        withCredentials: true,
      });
      setAdminAuthenticated(true);
    } catch (err) {
      setAdminAuthenticated(false);
    }
  };
  if (isAdminPath) checkAdminAuth();

  //  Redirect to login if not logged in
  if (!userIdFromStorage && !isAdminPath && !publicPaths.includes(currentPath)) {
    navigate("/login");
  }

  //  If logged in + access token, redirect to dashboard
  if (
    userIdFromStorage &&
    accessToken &&
    ["/", "/login", "/register", "/verify-otp"].includes(currentPath)
  ) {
    navigate("/user/dashboard");
  }

}, [currentUser, navigate, setCurrentUser]);



  useEffect(() => {
    const currentPath = window.location.pathname;

    if (adminAuthenticated === null) return;

    const publicAdminPaths = ["/admin/login", "/admin/register"];

    if (
      currentPath.startsWith("/admin") &&
      !adminAuthenticated &&
      !publicAdminPaths.includes(currentPath)
    ) {
      navigate("/admin/login");
    }

  
    if (
      adminAuthenticated &&
      publicAdminPaths.includes(currentPath)
    ) {
      navigate("/admin/dashboard");
    }

  }, [adminAuthenticated, navigate]);

  // Routing config
  const element = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/verify-otp", element: <OTPVerify /> },
    { path: "/report", element: <ReportIssue /> },

    // Admin
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/register", element: <AdminRegister /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/user/dashboard", element: currentUser ? <UserDashboard/> : <Login /> },
    { path: "/profile", element: <UserProfile/> },
    { path: "/sos", element: <SOSForm/> },
    { path: "/issues", element: <IssueTracker/> },
    { path: "/admin/events", element: <AdminEvents/> },
    { path: "/admin/events/:id", element: <AdminEventDetail/> },
   
    

  ]);

  return element;
};

export default ProjectRoutes;
