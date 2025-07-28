import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/admin/register", form);
      toast.success(res.data.message || "Registration Successful");
      setTimeout(() => navigate("/admin/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed because you are unauthraised  admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-orange-200">
        <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">Admin Register</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <FiUser className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 border border-orange-200"
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <FiMail className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 border border-orange-200"
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-orange-50 border border-orange-200"
              onChange={handleChange}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-orange-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
