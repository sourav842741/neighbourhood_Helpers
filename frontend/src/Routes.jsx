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

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [adminAuthenticated, setAdminAuthenticated] = useState(null); // null = checking

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    const currentPath = window.location.pathname;
    const publicPaths = [
      "/", "/login", "/register", "/verify-otp",
      "/admin/login", "/admin/register"
    ];
    const isAdminPath = currentPath.startsWith("/admin");

    // Set current user from localStorage
    if (userIdFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    //  Admin check: call backend /admin/me
    const checkAdminAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/admin/me", {
          withCredentials: true,
        });
        setAdminAuthenticated(true); //  verified from backend
      } catch (err) {
        setAdminAuthenticated(false);
      }
    };

    // Call admin auth only if on admin route
    if (isAdminPath) {
      checkAdminAuth();
    }

    // User protected route check
    if (!userIdFromStorage && !isAdminPath && !publicPaths.includes(currentPath)) {
      navigate("/login");
    }

    // User logged in but trying to access login/register/verify
    if (
      userIdFromStorage &&
      ["/login", "/register", "/verify-otp"].includes(currentPath)
    ) {
      navigate("/");
    }

    // For now, let admin/dashboard check run after auth status is fetched (below)
  }, [currentUser, navigate, setCurrentUser]);

  //  Second effect to handle admin redirect after checking
  useEffect(() => {
    const currentPath = window.location.pathname;

    // If checking is not done yet, do nothing
    if (adminAuthenticated === null) return;

    const publicAdminPaths = ["/admin/login", "/admin/register"];

    // Admin trying to access protected dashboard without auth
    if (
      currentPath.startsWith("/admin") &&
      !adminAuthenticated &&
      !publicAdminPaths.includes(currentPath)
    ) {
      navigate("/admin/login");
    }

    // Admin already authenticated but on login/register page
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

    // Admin
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/register", element: <AdminRegister /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/user/dashboard", element: currentUser ? <UserDashboard/> : <Login /> },

  ]);

  return element;
};

export default ProjectRoutes;
