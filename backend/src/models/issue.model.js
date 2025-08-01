import mongoose, { Schema } from "mongoose";

const issueSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    originalTitle: {
      type: String,
    },
    originalDescription: {
      type: String,
    },

   translatedTitle: {
      type: String,
      default: "",
    },
    translatedDescription: {
      type: String,
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["reported", "verified", "in-progress", "resolved"],
      default: "reported",
    },

    image: {
      type: String, // Cloudinary public_id or URL
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    reportedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: Date,
    inProgressAt: Date,
    resolvedAt: Date,

    upvoteCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },

    languageId: {
      type: String,
      default: "en", // e.g., "hi", "ta", "bn", "en"
    },
  },
  {
    timestamps: true,
  }
);

export const Issue = mongoose.model("Issue", issueSchema);
