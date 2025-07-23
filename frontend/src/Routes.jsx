import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerify from "./pages/OTPVerify";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");

    if (userIdFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    const allowedPaths = ["/login", "/register", "/verify-otp"];
    const currentPath = window.location.pathname;

    //  Not logged in & trying to access protected routes
    if (!userIdFromStorage && !allowedPaths.includes(currentPath)) {
      navigate("/login");
    }

    //  Already logged in but on auth route
    if (userIdFromStorage && allowedPaths.includes(currentPath)) {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser]);

  const element = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/verify-otp",
      element: <OTPVerify />,
    },
  ]);

  return element;
};

export default ProjectRoutes;
