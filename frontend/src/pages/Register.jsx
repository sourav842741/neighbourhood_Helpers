import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiImage,
  FiUsers,
  FiUploadCloud,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    team_role: "",
    avatar: null,
    coverImage: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" || name === "coverImage") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const res = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        data
      );

      toast.success(res.data.message || "Registration successful");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: formData.email } });
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 to-white px-4">
      <ToastContainer />
      <div className="w-full max-w-lg bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-orange-200">
        <h2 className="text-3xl font-bold text-center text-orange-700 mb-8">
          Create an Account
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          {/* Full Name */}
          <div className="relative">
            <FiUser className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 focus:ring-2 ring-orange-300 border border-orange-200 text-gray-800"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FiMail className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 focus:ring-2 ring-orange-300 border border-orange-200 text-gray-800"
              onChange={handleChange}
              required
            />
          </div>

          {/* Username */}
          <div className="relative">
            <FiUsers className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 focus:ring-2 ring-orange-300 border border-orange-200 text-gray-800"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 focus:ring-2 ring-orange-300 border border-orange-200 text-gray-800"
              onChange={handleChange}
              required
            />
          </div>

          {/* Team Role */}
          <div className="relative">
            <FiUsers className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="text"
              name="team_role"
              placeholder="Team Role"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-orange-50 focus:ring-2 ring-orange-300 border border-orange-200 text-gray-800"
              onChange={handleChange}
              required
            />
          </div>

          {/* Avatar Upload */}
          <div className="relative">
            <FiImage className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-gray-700 cursor-pointer"
            />
          </div>

          {/* Cover Image Upload */}
          <div className="relative">
            <FiUploadCloud className="absolute top-3.5 left-3 text-orange-500" />
            <input
              type="file"
              name="coverImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-gray-700 cursor-pointer"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition duration-300"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
