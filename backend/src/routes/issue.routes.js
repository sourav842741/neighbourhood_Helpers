import express from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../controllers/issue.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Create Issue with optional image
router.post("/", verifyJWT, upload.array("issuePhotos", 10), createIssue);
// Get all issues
router.get("/", getAllIssues);
// Get single issue
router.get("/:id", getIssueById);
// Update issue with optional new image
router.put("/:id", verifyJWT, upload.array("issuePhotos", 10), updateIssue);
// Delete issue (and its image)
router.delete("/:id", verifyJWT, deleteIssue);

export default router;
