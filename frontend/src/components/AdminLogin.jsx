import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/admin/login", {
        email,
        password,
      }, { withCredentials: true });

     toast.success("Admin Login Successful");
    navigate("/admin/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed due to unauthroised email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-orange-200">
        <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="email"
              placeholder="Admin Email"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 border border-orange-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-orange-50 border border-orange-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute top-3.5 right-3 text-orange-500 cursor-pointer"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Not registered?{" "}
          <Link to="/admin/register" className="text-orange-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
