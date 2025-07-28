import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FiMail, FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState("");        
  const [password, setPassword] = useState("");  
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/users/login", {
        email,
        password,
      });

      const user = res.data?.data?.user;
      const accessToken = res.data?.data?.accessToken;

      if (accessToken && user?._id) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", user._id);

         toast.success("Login successful!");
  setTimeout(() => {
    navigate("/user/dashboard");
  }, 1000);
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-white px-4">
      <ToastContainer />
      <div className="bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-orange-200">

        {/* Welcome Text */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-orange-600">Welcome Back 👋</h1>
          <p className="text-gray-600 mt-2 text-sm">Login to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 focus:ring-2 ring-orange-300 border border-orange-200 text-gray-800"
            />
          </div>

          <div className="relative">
            <FiLock className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-orange-50 focus:ring-2 ring-orange-300 border border-orange-200 text-gray-800"
            />
            <div
              className="absolute right-3 top-3.5 text-orange-500 cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* 👇 Register Link */}
        <div className="text-sm text-center mt-5 text-gray-700">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-orange-600 hover:underline font-semibold"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
