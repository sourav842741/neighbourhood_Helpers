import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Register Admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // Restrict to specific admin email
  const allowedAdminEmail = process.env.ALLOWED_ADMIN_EMAIL;
  if (email !== allowedAdminEmail) {
    throw new ApiError(403, "This email is not authorized to register as admin");
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(400, "Admin already exists");
  }

  const newAdmin = await Admin.create({ fullName, email, password });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    adminId: newAdmin._id,
  });
});


// Login Admin with cookies (access + refresh tokens)
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Restrict to specific admin email
  const allowedAdminEmail = process.env.ALLOWED_ADMIN_EMAIL;
  if (email !== allowedAdminEmail) {
    throw new ApiError(403, "This email is not authorized to login as admin");
  }

  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.refreshToken = refreshToken;
  await admin.save();

  res.cookie("admin_token", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: "Lax", // ✅ better than "Strict" for most flows
  path: "/",       // ✅ ensures it's accessible across routes
  maxAge: 24 * 60 * 60 * 1000, // 1 day
})

    .status(200)
    .json({
      success: true,
      message: "Login successful",
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
});


// Logout Admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(200).json({ success: true, message: "Already logged out" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded?._id) {
      await Admin.findByIdAndUpdate(decoded._id, { $unset: { refreshToken: "" } });
    }
  } catch (error) {
    // If token is invalid, ignore error to ensure logout proceeds
  }

  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({
    success: true,
    message: "Admin logged out successfully",
  });
});

// Delete Admin
export const deleteAdmin = asyncHandler(async (req, res) => {
  const adminId = req.params.id;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  await Admin.findByIdAndDelete(adminId);

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
  });
});

// this is used not for sos send to admin and also find email for admin
export const getAdminEmails = async () => {
  const admins = await Admin.find({}, "email fullName");

  if (!admins.length) {
    throw new ApiError(404, "No admin found to notify");
  }

  return admins.map(admin => admin.email);
};

export const getAdminProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin authenticated",
    admin: req.admin,
  });
});

