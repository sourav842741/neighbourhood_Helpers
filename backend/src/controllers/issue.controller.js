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

//  Local createAnalytics function
const createAnalytics = async (issueId) => {
  if (!issueId) throw new Error("Issue ID is required for analytics");
  const existing = await Analytics.findOne({ issueId });
  if (!existing) {
    await Analytics.create({ issueId, views: 0 });
  }
};

//  Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//  Generate & Upload QR to Cloudinary
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

//  Generate PDF with QR
const generatePDFWithQR = async (issue, user, filePath, qrBuffer) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.fontSize(20).fillColor("#d32f2f").text("🚨 Issue Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).fillColor("black").text(` Reference ID: ${issue._id}`);
    doc.text(` Reported At: ${new Date(issue.reportedAt).toLocaleString()}`);
    doc.text(` Reported By: ${user.username}`);
    doc.text(` Email: ${user.email}`);
    doc.text(` Location: ${issue.location || "N/A"}`);
    doc.moveDown();
    doc.text(` Title: ${issue.title}`);
    doc.text(` Description: ${issue.description}`);
    doc.moveDown();

    doc.fontSize(14).text("🔎 Scan QR for Details:", { underline: true });
    doc.image(qrBuffer, { fit: [150, 150] });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

//  Create Issue
const createIssue = asyncHandler(async (req, res) => {
  const { title, description, languageId, location } = req.body;
  if (!title || !description || !languageId) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  let imageId = "";
  if (req.file) {
    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) throw new ApiError(500, "Image upload failed");
    imageId = uploadedImage.public_id;
  }

  const issue = await Issue.create({
    title,
    description,
    languageId,
    location,
    imageId,
    userId,
    status: "reported",
    reportedAt: new Date()
  });

  //  Analytics Entry
  await createAnalytics(issue._id);

  //  QR Code Content
  const qrData = `
Issue ID: ${issue._id}
Title: ${issue.title}
Description: ${issue.description}
Location: ${issue.location}
Reported By: ${user.username || "N/A"}
Email: ${user.email}
Reported At: ${new Date(issue.reportedAt).toLocaleString()}
  `;

  //  Upload QR for Gmail
  const qrUrl = await generateAndUploadQR(qrData);

  //  Generate PDF with QR
  const qrBuffer = await qr.toBuffer(qrData);
  const pdfPath = path.join("public", `issue-${issue._id}.pdf`);
  await generatePDFWithQR(issue, user, pdfPath, qrBuffer);

  //  Send Email
  await sendEmail({
    to: user.email,
    subject: "📝 Your Issue Report Receipt",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 10px;">
        <h2 style="color: #d32f2f;">🚨 Issue Report Confirmation</h2>
        <p>Hello <strong>${user.username}</strong>,</p>
        <p>Your issue has been successfully reported with the following details:</p>
        <ul>
          <li><strong>Issue ID:</strong> ${issue._id}</li>
          <li><strong>Title:</strong> ${issue.title}</li>
          <li><strong>Description:</strong> ${issue.description}</li>
          <li><strong>Location:</strong> ${issue.location || "N/A"}</li>
          <li><strong>Reported At:</strong> ${new Date(issue.reportedAt).toLocaleString()}</li>
        </ul>
        <p><strong>🔎 Scan the QR Code below for reference:</strong></p>
        <img src="${qrUrl}" alt="QR Code" width="150" height="150" style="border:1px solid #ccc; padding:5px;" />
        <p>The attached PDF also includes this QR code.</p>
        <br/>
        <p style="color: grey; font-size: 12px;">This is an automated email from Neighborhood Helper. Please do not reply.</p>
      </div>
    `,
    attachments: [
      {
        filename: `Issue_Report_${issue._id}.pdf`,
        path: pdfPath,
      },
    ],
  });

  //  Clean up PDF
  fs.unlink(pdfPath, (err) => {
    if (err) console.error("Failed to delete PDF:", err);
  });

  res.status(201).json(new ApiResponse(201, issue, "Issue reported and emailed successfully"));
});

const getAllIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find()
    .populate("userId", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, issues, "Issues fetched successfully")
  );
});

const getIssueById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id)
    .populate("userId", "username email");

  if (!issue) {
    throw new ApiError(404, "Issue not found");
  }

  res.status(200).json(new ApiResponse(200, issue, "Issue details"));
});

const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    throw new ApiError(404, "Issue not found");
  }

  if (issue.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this issue");
  }

    // Handle image update
  if (req.file) {
      // Delete old image from Cloudinary
    if (issue.imageId) {
      await deleteFromCloudinary(issue.imageId);
    }

    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
      throw new ApiError(500, "New image upload failed");
    }
    issue.imageId = uploadedImage.public_id;
  }

  Object.assign(issue, req.body);
  await issue.save();

  res.status(200).json(
    new ApiResponse(200, issue, "Issue updated successfully")
  );
});

const deleteIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) {
    throw new ApiError(404, "Issue not found");
  }

  if (issue.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this issue");
  }

  if (issue.imageId) {
    await deleteFromCloudinary(issue.imageId);
  }

  //  Delete analytics entry when issue is deleted
  await Analytics.deleteOne({ issueId: issue._id });

  await issue.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, "Issue deleted successfully")
  );
});

export {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue
};
