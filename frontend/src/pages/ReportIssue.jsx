import React, { useState } from 'react';
import axios from "axios";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserNavbar from '@/components/UserNavbar';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const issueTypes = ['Broken Roads', 'Garbage Dumps', 'Street Lights'];

const ReportIssue = () => {
  let [formData, setFormData] = useState({
    title: "",
    languageId: "",
    description: "",
    location: "",
    issuePhotos: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Unauthorized. Please login first.");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      const res = await axios.post(
        "http://localhost:8000/api/v1/issues",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success(res.data.message || "Issue reported successfully!");

      // Reset form after successful submission
      setFormData({
        title: "",
        languageId: "",
        description: "",
        location: "",
        issuePhotos: null
      });

      e.target.reset();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Issue creation failed!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "issuePhotos") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      <UserNavbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full mt-15">
        <h1 className="text-2xl font-semibold mb-6">Report an Issue</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          encType="multipart/form-data"
        >
          {/* Issue Type */}
          <div>
            <label htmlFor="title" className="block mb-2 font-medium text-gray-700">Select Issue Type</label>
            <select
              id="title"
              name='title'
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="" disabled>Select an issue type</option>
              {issueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="languageId" className="block mb-2 font-medium text-gray-700">
              Language
            </label>
            <input
              id="languageId"
              name='languageId'
              type="text"
              placeholder="Enter language name"
              value={formData.languageId}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
              Issue Description
            </label>
            <textarea
              id="description"
              name='description'
              placeholder="Provide a detailed description of the issue..."
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block mb-2 font-medium text-gray-700">
              Location Details
            </label>
            <input
              id="location"
              name='location'
              type="text"
              placeholder="Enter location details"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label htmlFor="issuePhotos" className="block mb-2 font-medium text-gray-700">
              Attach Photos
            </label>
            <input
              id="issuePhotos"
              name='issuePhotos'
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 p-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-full font-medium transition"
          >
            Submit Report
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ReportIssue;
