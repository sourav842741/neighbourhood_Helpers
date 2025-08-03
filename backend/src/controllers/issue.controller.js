import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import qr from "qrcode";
import { Issue } from "../models/issue.model.js";
import { User } from "../models/user.model.js";
import { Analytics } from "../models/analyatics.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";

// Local createAnalytics function
const createAnalytics = async (issueId) => {
  if (!issueId) throw new Error("Issue ID is required for analytics");
  const existing = await Analytics.findOne({ issueId });
  if (!existing) {
    await Analytics.create({ issueId, views: 0 });
  }
};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate & Upload QR to Cloudinary
const generateAndUploadQR = async (qrData) => {
  const qrBuffer = await qr.toBuffer(qrData);
  const tempPath = path.join("public", `qr-${Date.now()}.png`);
  fs.writeFileSync(tempPath, qrBuffer);

  const uploaded = await uploadOnCloudinary(tempPath);

  // Safely delete temp file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  return uploaded.secure_url;
};

// Generate PDF with QR
const generatePDFWithQR = async (issue, user, filePath, qrBuffer) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(20).fillColor("#d32f2f").text("🚨 Issue Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).fillColor("black").text(`Reference ID: ${issue._id}`);
    doc.text(`Reported At: ${new Date(issue.reportedAt).toLocaleString()}`);
    doc.text(`Reported By: ${user.username}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Location: ${issue.location || "N/A"}`);
    doc.moveDown();
    doc.text(`Title: ${issue.title}`);
    doc.text(`Description: ${issue.description}`);
    doc.moveDown();

    doc.fontSize(14).text("🔎 Scan QR for Details:", { underline: true });
    doc.image(qrBuffer, { fit: [150, 150] });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

// Create Issue
const createIssue = asyncHandler(async (req, res) => {
  const { title, description, languageId, location } = req.body;
  if (!title || !description || !languageId || !location) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  let imageId = [];

if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    const uploadedImage = await uploadOnCloudinary(file.path);
    if (!uploadedImage) throw new ApiError(500, "Image upload failed");
    imageId.push(uploadedImage.secure_url);
  }
}


  const issue = await Issue.create({
    title,
    description,
    languageId,
    location,
   imageId: imageId,
    userId,
    status: "reported",
    reportedAt: new Date()
  });

  // Analytics Entry
  await createAnalytics(issue._id);

  // QR Code Content
  const qrData = `
Issue ID: ${issue._id}
Title: ${issue.title}
Description: ${issue.description}
Location: ${issue.location}
Reported By: ${user.username || "N/A"}
Email: ${user.email}
Reported At: ${new Date(issue.reportedAt).toLocaleString()}
`;

  // Upload QR for Gmail
  const qrUrl = await generateAndUploadQR(qrData);

  // Generate PDF with QR
  const qrBuffer = await qr.toBuffer(qrData);
  const pdfPath = path.join("public", `issue-${issue._id}.pdf`);
  await generatePDFWithQR(issue, user, pdfPath, qrBuffer);

  // Send Email
  await sendEmail({
    to: user.email,
    subject: "📝 Your Issue Report Receipt",
   html: `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">
      <div style="background-color: #d32f2f; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">🚨 Issue Report Confirmation</h2>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">Hello <strong>${user.username}</strong>,</p>
        <p style="font-size: 15px; color: #444;">Your issue has been successfully reported with the following details:</p>
        <ul style="list-style: none; padding-left: 0; color: #333; font-size: 15px;">
          <li style="margin-bottom: 8px;"><strong>🆔 Issue ID:</strong> ${issue._id}</li>
          <li style="margin-bottom: 8px;"><strong>📝 Title:</strong> ${issue.title}</li>
          <li style="margin-bottom: 8px;"><strong>📄 Description:</strong> ${issue.description}</li>
          <li style="margin-bottom: 8px;"><strong>📍 Location:</strong> ${issue.location || "N/A"}</li>
          <li style="margin-bottom: 8px;"><strong>📅 Reported At:</strong> ${new Date(issue.reportedAt).toLocaleString()}</li>
        </ul>
        <div style="margin: 20px 0; text-align: center;">
          <p style="font-size: 15px; font-weight: bold; color: #333;">🔎 Scan the QR Code below for reference:</p>
          <img src="${qrUrl}" alt="QR Code" width="150" height="150" style="border: 1px solid #ccc; border-radius: 8px; padding: 5px;" />
          <p style="font-size: 14px; color: #555;">(The attached PDF also includes this QR code.)</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 13px; color: #888; text-align: center;">This is an automated email from <strong>Neighborhood Helper</strong>. Please do not reply.</p>
      </div>
    </div>
  </div>
`,

    attachments: [
      {
        filename: `Issue_Report_${issue._id}.pdf`,
        path: pdfPath,
      },
    ],
  });

  // Clean up PDF
  fs.unlink(pdfPath, (err) => {
    if (err) console.error("Failed to delete PDF:", err);
  });
console.log("Uploaded Image URLs:", imageId);

  res.status(201).json(new ApiResponse(201, issue, "Issue reported and emailed successfully"));
});

// Get All Issues
const getAllIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find()
    .populate("userId", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, issues, "Issues fetched successfully")
  );
});

// Get Single Issue by ID
const getIssueById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id).populate("userId", "username email");
  if (!issue) throw new ApiError(404, "Issue not found");

  res.status(200).json(new ApiResponse(200, issue, "Issue details"));
});

// Update Issue
const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, "Issue not found");

  if (issue.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this issue");
  }

  if (req.files && req.files.length > 0) {
    if (issue.imageId && issue.imageId.length > 0) {
      for (const publicId of issue.imageId) {
        await deleteFromCloudinary(publicId);
      }
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const uploadedImage = await uploadOnCloudinary(file.path);
      if (!uploadedImage) throw new ApiError(500, "New image upload failed");
      uploadedImages.push(uploadedImage.public_id);
    }
    issue.imageId = uploadedImages;
  }

  if (!req.body) {
    throw new ApiError(400, "Request body is missing");
  }

  const allowedFields = [
    "title",
    "description",
    "status",
    "location",
    "translatedTitle",
    "translatedDescription",
    "languageId",
    "upvoteCount",
    "commentCount",
  ];

  console.log("Request body:", req.body);

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      issue[field] = req.body[field];
    }
  });

  console.log("Issue status before save:", issue.status);

  await issue.save();

  res.status(200).json(new ApiResponse(200, issue, "Issue updated successfully"));
});



// Delete Issue
const deleteIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, "Issue not found");

  if (issue.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this issue");
  }

  if (issue.imageId) {
    await deleteFromCloudinary(issue.imageId);
  }

  await Analytics.deleteOne({ issueId: issue._id });
  await issue.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Issue deleted successfully"));
});

export {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue
};
