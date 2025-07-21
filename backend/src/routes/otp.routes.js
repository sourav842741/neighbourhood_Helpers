import express from "express";
import {  verifyEmailOTP } from "../controllers/otp.controller.js";
import { resendOTP } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/verify-otp", verifyEmailOTP);
router.post("/resend-otp", resendOTP);

export default router;
