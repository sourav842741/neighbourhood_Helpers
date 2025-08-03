import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import mongoose from "mongoose";

//  Create Event and send email to all users
export const createEvent = asyncHandler(async (req, res) => {
  const { name, description, location, startTime, endTime } = req.body;
  const createdBy = req.admin?._id;

  if (!name || !startTime || !endTime) {
    throw new ApiError(400, "Event name, startTime and endTime are required");
  }

  const event = await Event.create({
    name,
    description,
    location,
    startTime,
    endTime,
   createdBy:  req.admin._id,
  });

  // Fetch all user emails
  const users = await User.find({}, "email fullName");
  const recipients = users.map((user) => user.email);

  // Send notification email
  await sendEmail({
    to: recipients,
    subject: `📢 New Event: ${event.name}`,
   html: `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
      
      <!-- Header -->
      <div style="background-color: #1e90ff; padding: 24px 20px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 28px;">Neighborhood Helper</h1>
      </div>

      <!-- Banner Image -->
      <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?fit=crop&w=600&q=80" 
           alt="Event" 
           style="width: 100%; height: auto; display: block;" />

      <!-- Content -->
      <div style="padding: 25px 30px;">
        <h2 style="color: #2c3e50; font-size: 22px; margin-top: 0;">📅 ${event.name}</h2>
        <p style="color: #444; font-size: 16px; margin: 10px 0 20px;">
          ${event.description || "No description provided."}
        </p>

        <!-- Details -->
        <div style="color: #2f3542; font-size: 15px; line-height: 1.6;">
          <p><strong>📍 Location:</strong> ${event.location || "To be decided"}</p>
          <p><strong>🕒 Time:</strong> ${new Date(event.startTime).toLocaleString()} - ${new Date(event.endTime).toLocaleString()}</p>
        </div>

        <!-- CTA Button -->
        <div style="margin: 30px 0; text-align: center;">
          <a href="#" 
             style="padding: 12px 25px; background-color: #1e90ff; color: white; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 6px; display: inline-block;">
            View Event
          </a>
        </div>

        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 13px; color: #888888; text-align: center; margin: 0;">
          You're receiving this because you're part of the <strong>Neighborhood Helper</strong> community. Please do not reply to this message.
        </p>
      </div>
    </div>
  </div>
`,

  });

  res.status(201).json(new ApiResponse(201, event, "Event created and notifications sent"));
});

//  Get All Events
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().populate("createdBy", "fullName email");
  res.status(200).json(new ApiResponse(200, events, "All events fetched"));
});

//  Get Single Event
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await Event.findById(id).populate("createdBy", "fullName email");

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  res.status(200).json(new ApiResponse(200, event, "Event details fetched"));
});


//  Update Event
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.createdBy.toString() !== req.admin?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this event");
  }

  Object.assign(event, req.body);
  await event.save();

  res.status(200).json(new ApiResponse(200, event, "Event updated successfully"));
});

// Delete Event
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // if (event.createdBy.toString() !== req.admin?._id.toString()) {
  //   throw new ApiError(403, "You are not authorized to delete this event");
  // }

  await event.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Event deleted successfully"));
});
