import { OTP } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt"; 



export const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otp); 

  if (!isMatch) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not registered. Please register first.");
  }

  user.isVerified = true;
  await user.save();

  await OTP.deleteMany({ email }); 

  return res.status(200).json(
    new ApiResponse(200, { email, isVerified: true }, "Email verified successfully")
  );
});



