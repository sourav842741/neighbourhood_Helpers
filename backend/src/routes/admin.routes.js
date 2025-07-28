import express from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  deleteAdmin,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getAdminProfile } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.delete("/:id", isAdmin, deleteAdmin); // only logged-in admin can delete
router.get("/me", isAdmin, getAdminProfile);

export default router;
