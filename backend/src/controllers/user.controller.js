import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { OTP } from "../models/otp.model.js";
import otpGenerator from "otp-generator";
import { sendEmail } from "../utils/sendEmail.js";
import mongoose from "mongoose";





const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, team_role, username, password, teams } = req.body;

  if (team_role?.toLowerCase() === "admin") {
    return res.status(403).json({
      message: "You are not allowed to register with admin privileges.",
    });
  }

  if ([fullName, email, username, password, team_role].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const files = Object.assign({}, req.files);
  const avatarLocalPath = files.avatar?.[0]?.path;
  const coverImageLocalPath = files.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar?.url) {
    throw new ApiError(400, "Failed to upload avatar to Cloudinary");
  }

  // Create user (but don't log in yet)
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
    team_role,
    teams,
    isVerified: false, 
  });

  // Delete existing OTPs for this email (clean-up)
  await OTP.deleteMany({ email });

  // Generate OTP
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  // Save OTP in DB
  await OTP.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
    verified: false,
  });

  // Email Content
  const htmlContent = `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
      
      <div style="background-color: #ff6b00; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">My Neighborhood Helper</h2>
      </div>

      <div style="padding: 30px;">
        <h3 style="color: #333333;">🔐 Email Verification</h3>
        <p style="color: #555;">Thank you for signing up! Use the OTP below to verify your email address:</p>

        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; background-color: #f2f2f2; border: 1px dashed #ccc; border-radius: 6px; color: #ff6b00;">
            ${otp}
          </div>
        </div>

        <p style="color: #888; font-size: 14px; text-align: center;">
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p style="font-size: 13px; color: #999; margin-top: 30px;">Didn’t request this? Just ignore this email.</p>
      </div>

      <div style="background-color: #fafafa; text-align: center; padding: 15px; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} My Neighborhood Helper. All rights reserved.
      </div>

    </div>
  </div>
`;


  // Send email
  await sendEmail({
    to: email,
    subject: "🔐 Verify Your Email - Neighborhood Helper",
    html: htmlContent,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully. Please verify your email."));
});

const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required to resend OTP");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // Delete existing OTPs for the email
  await OTP.deleteMany({ email });

  // Generate new OTP
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  // Save new OTP
  await OTP.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    verified: false,
  });

  // Prepare email HTML content
  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="background-color: #ff6b00; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">My Neighborhood Helper</h2>
        </div>
        <div style="padding: 30px;">
          <h3 style="color: #333333;">🔄 Resend OTP</h3>
          <p style="color: #555;">Here is your new OTP to verify your email address:</p>
          <div style="text-align: center; margin: 20px 0;">
            <div style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; background-color: #f2f2f2; border: 1px dashed #ccc; border-radius: 6px; color: #ff6b00;">
              ${otp}
            </div>
          </div>
          <p style="color: #888; font-size: 14px; text-align: center;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
        </div>
        <div style="background-color: #fafafa; text-align: center; padding: 15px; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} My Neighborhood Helper. All rights reserved.
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "🔄 Resend OTP - Neighborhood Helper",
    html: htmlContent,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP has been resent successfully"));
});



const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

if (!user.isVerified) {
  throw new ApiError(401, "Email not verified. Please verify before logging in.");
}

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; //seasion or cookie dono same hn wohi se token mil jaegaa

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});


const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

 const updateUserAvatar = asyncHandler(async (req, res) => {
  console.log("Received file:", req.file);

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    console.error("Avatar file is missing in request");
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("Cloudinary upload response:", avatar);

  if (!avatar || !avatar.secure_url) {
    throw new ApiError(400, "Error while uploading avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.secure_url,
      },
    },
    { new: true }
  ).select("-password");

  console.log("User after avatar update:", user);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// ...............for team role and teams assign purpuse only..............

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await User.findById(id).populate("teams");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// Get all users
const getAllUsersTeamRole = asyncHandler(async (req, res) => {
  const users = await User.find().populate("teams");
  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

//Update user
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { team_role, teams } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        team_role,
        teams,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

//Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Delete avatar if exists
  if (user.avatar?.public_id) {
    console.log("Deleting avatar:", user.avatar.public_id);
    await cloudinary.uploader.destroy(user.avatar.public_id, { invalidate: true });
  }

  // Delete cover image if exists
  if (user.coverImage?.public_id) {
    console.log("Deleting cover image:", user.coverImage.public_id);
    await cloudinary.uploader.destroy(user.coverImage.public_id, { invalidate: true });
  }

  await user.deleteOne();

  res.status(200).json({ message: "User deleted successfully" });
});



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllUsersTeamRole,
   resendOTP,
};
