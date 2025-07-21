import nodemailer from "nodemailer";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or use your own SMTP settings
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNotificationToAllUsers = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    throw new ApiError(400, "Subject and message are required");
  }

  const users = await User.find({}, "email");

  if (!users.length) {
    throw new ApiError(404, "No users found to notify");
  }

  const emailList = users.map((user) => user.email);

const mailOptions = {
    from: `"Neighborhood Helper" <${process.env.SMTP_USER}>`,
    to: emailList,
    subject: subject,
   html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);">
      
      <!-- Header -->
      <div style="background-color: #1e90ff; padding: 24px 20px; text-align: center;">
        <h1 style="color: white; font-size: 28px; margin: 0;">Neighborhood Helper</h1>
      </div>

      <!-- Banner -->
      <img src="https://img.freepik.com/free-vector/attention-concept-illustration_114360-7902.jpg" 
           alt="Alert Banner" 
           style="width: 100%; height: auto; display: block;" />

      <!-- Body Content -->
      <div style="padding: 30px;">
        <h2 style="color: #2c3e50; font-size: 22px; margin-top: 0;">📢 ${subject}</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 15px 0;">
          ${message}
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

        <!-- Hindi Section -->
        <p style="color: #333333; font-size: 16px; line-height: 1.6;">
          🔔 <strong>हिंदी में सूचना:</strong><br/>
          सर्वर आज अस्थायी रूप से डाउन रहेगा। कृपया कोई भी महत्वपूर्ण कार्य बाद में करें।
        </p>

        <!-- Button -->
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://yourdomain.com" 
             style="background-color: #1e90ff; color: white; padding: 12px 25px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">
            Visit Neighborhood Helper
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f3f5; padding: 20px; text-align: center; color: #7a7a7a; font-size: 13px;">
        You received this email because you're part of the <strong>Neighborhood Helper</strong> community.<br/>
        📅 ${new Date().toDateString()} • © ${new Date().getFullYear()} Neighborhood Helper.
      </div>
    </div>
  </div>
`,

  };


  // Send to all users
  await transporter.sendMail(mailOptions);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Notification sent to all users"));
});

export { sendNotificationToAllUsers };
