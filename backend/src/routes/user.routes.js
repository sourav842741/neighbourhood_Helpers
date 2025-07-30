import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllUsersTeamRole,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// ------------------ Auth Routes ------------------
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

// ------------------ User Profile ------------------
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// ✅ ✅ FIXED: File Upload Routes (must match frontend)
router.route("/update-avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

router.route("/update-cover").patch(
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

// ------------------ Admin/User Management ------------------
router.route("/c/:username").get(isAdmin, getUserById);
router.route("/update-user-role").patch(isAdmin, updateUserRole);
// user.route.js
router.delete('/:userId/delete-user', deleteUser);

router.route("/team-roles").get(isAdmin, getAllUsersTeamRole);

export default router;
