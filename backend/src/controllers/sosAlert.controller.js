import { SOSAlert } from "../models/sosAlert.model.js";
import { getAdminEmails } from "./admin.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from "nodemailer";

// Email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send alert
export const sendSOSAlert = asyncHandler(async (req, res) => {
  const { location, message } = req.body;

  if (!location) {
    throw new ApiError(400, "Location is required");
  }

  // Step 1: Check if unresolved alert already exists
  let alert = await SOSAlert.findOne({
    userId: req.user._id,
    isResolved: false,
  });

  const isNew = !alert;

  if (alert) {
    // Step 2: If already exists, just update details
    alert.location = location;
    alert.message = message;
    await alert.save();
  } else {
    // Step 3: Else create new alert
    alert = await SOSAlert.create({
      userId: req.user._id,
      location,
      message,
    });
  }

  // Step 4: Only send email if it's a new alert
  if (isNew) {
    const adminEmails = await getAdminEmails();

  const mailOptions = {
  from: `"Neighborhood Helper" <${process.env.EMAIL_USER}>`,
  to: adminEmails,
  subject: "🚨 SOS Alert from User",
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🚨 Emergency SOS Alert</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;"><strong>🚶‍♂️ User:</strong> ${req.user.fullName}</p>
          <p style="font-size: 16px; color: #333;"><strong>📧 Email:</strong> ${req.user.email}</p>
          <p style="font-size: 16px; color: #333;"><strong📍 Location:</strong> ${location}</p>
          <p style="font-size: 16px; color: #333;"><strong>💬 Message:</strong> ${message || "I need immediate help!"}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="text-align: center; color: #999; font-size: 14px;">
            📅 Sent on <strong>${new Date().toLocaleString()}</strong>
          </p>
        </div>
        <div style="background-color: #f9f9f9; text-align: center; padding: 15px; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} Neighborhood Helper. Stay safe!
        </div>
      </div>
    </div>
  `,
};


    await transporter.sendMail(mailOptions);
  }

  res.status(201).json(
    new ApiResponse(
      201,
      alert,
      isNew
        ? "SOS Alert created and email sent to admins."
        : "You already have an active SOS alert. We updated it."
    )
  );
});



// Get all alerts (admin only)
export const getAllSOSAlerts = asyncHandler(async (req, res) => {
  const alerts = await SOSAlert.find()
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, alerts, "All SOS alerts fetched"));
});

// Resolve alert
export const resolveSOSAlert = asyncHandler(async (req, res) => {
  const { alertId } = req.params;

  const updated = await SOSAlert.findByIdAndUpdate(
    alertId,
    { isResolved: true },
    { new: true }
  );

  if (!updated) throw new ApiError(404, "Alert not found");

  res
    .status(200)
    .json(new ApiResponse(200, updated, "Alert marked as resolved"));
});

