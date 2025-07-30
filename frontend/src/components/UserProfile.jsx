import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUpload } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserNavbar from "./UserNavbar";
import Footer from "./Footer";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const token = localStorage.getItem("accessToken");

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/users/current-user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
      setForm({
        fullName: res.data.data.fullName || "",
        email: res.data.data.email || "",
      });
    } catch {
      toast.error("Failed to fetch user data.");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.patch("http://localhost:8000/api/v1/users/update-account", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated!");
      fetchUser();
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await axios.patch("http://localhost:8000/api/v1/users/change-password", passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Password changed!");
    } catch {
      toast.error("Failed to change password.");
    }
  };

  const handleImageUpload = async (type) => {
    const file = type === "avatar" ? avatarFile : coverFile;
    if (!file) {
      toast.warning(`Please select a ${type} image first`);
      return;
    }

    const formData = new FormData();
    formData.append(type === "avatar" ? "avatar" : "coverImage", file);

    try {
      const endpoint = type === "avatar" ? "update-avatar" : "update-cover";
      await axios.patch(`http://localhost:8000/api/v1/users/${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(`${type === "avatar" ? "Avatar" : "Cover image"} updated!`);
      fetchUser();
      if (type === "avatar") setAvatarFile(null);
      if (type === "cover") setCoverFile(null);
    } catch {
      toast.error(`Failed to update ${type === "avatar" ? "avatar" : "cover image"}.`);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (type === "avatar") setAvatarFile(file);
    if (type === "cover") setCoverFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const showDeleteConfirmation = () => {
    toast.info(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p className="text-sm text-gray-800 font-medium">
            Are you sure you want to delete your account?
          </p>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              onClick={async () => {
                try {
                  await axios.delete(
                    `http://localhost:8000/api/v1/users/${user._id}/delete-user`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  toast.success("Account deleted successfully.");
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("userId");
                  setUser(null);
                  closeToast();
                  setTimeout(() => {
                    window.location.href = "/";
                  }, 1500);
                } catch (error) {
                  toast.error("Failed to delete account.");
                  console.error(
                    "Account deletion error:",
                    error?.response?.data || error.message
                  );
                  closeToast();
                }
              }}
            >
              Yes, Delete
            </button>
            <button
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <UserNavbar showProfileNav={true} />
      <div className="max-w-4xl mx-auto mt-24 p-6">
        <h2 className="text-3xl font-bold mb-6 text-orange-600">User Profile</h2>

        {/* Cover Image */}
        <Card
          className="mb-6 p-4 border-dashed border-2 border-orange-300 bg-orange-50"
          onDrop={(e) => handleDrop(e, "cover")}
          onDragOver={handleDragOver}
        >
          <CardContent>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Cover Image</h3>
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-[300px] object-cover rounded-lg shadow"
              />
            ) : (
              <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No Cover Image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="mt-2 file:bg-orange-100 file:text-orange-600 file:rounded file:border-none file:px-3 file:py-1 file:mr-2"
              onChange={(e) => setCoverFile(e.target.files[0])}
            />
            {coverFile && (
              <img
                src={URL.createObjectURL(coverFile)}
                alt="Preview"
                className="w-full h-[300px] object-cover mt-2 rounded-lg"
              />
            )}
            <Button
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => handleImageUpload("cover")}
            >
              <FiUpload className="mr-2" /> Upload Cover
            </Button>
          </CardContent>
        </Card>

        {/* Avatar */}
        <Card
          className="mb-6 p-4 flex items-center space-x-4 border-dashed border-2 border-orange-300 bg-orange-50"
          onDrop={(e) => handleDrop(e, "avatar")}
          onDragOver={handleDragOver}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-orange-500 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 border-4 border-orange-500">
              ?
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              className="file:bg-orange-100 file:text-orange-600 file:rounded file:border-none file:px-3 file:py-1 file:mr-2"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
            {avatarFile && (
              <img
                src={URL.createObjectURL(avatarFile)}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full mt-2 object-cover"
              />
            )}
            <Button
              className="ml-2 mt-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => handleImageUpload("avatar")}
            >
              <FiUpload className="mr-2" /> Upload Avatar
            </Button>
          </div>
        </Card>

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="mb-6 space-y-4">
          <Card className="p-4 bg-white shadow">
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  className="mt-1 p-2 border rounded w-full"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="mt-1 p-2 border rounded w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={form.email}
                  disabled
                />
              </div>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Password Form */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Card className="p-4 bg-white shadow">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-600">Change Password</h3>
              <input
                type="password"
                placeholder="Old Password"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setPasswords({ ...passwords, oldPassword: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Delete Account */}
        {user?._id && (
          <Card className="mt-6 p-4 bg-white shadow">
            <CardContent className="flex flex-col items-start space-y-3">
              <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-600">
                Deleting your account will remove all your data. This action is irreversible.
              </p>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={showDeleteConfirmation}
              >
                Yes, Delete My Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default UserProfile;
