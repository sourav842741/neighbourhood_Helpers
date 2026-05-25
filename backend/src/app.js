import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,   
    credentials: true
}))

app.use(express.json({limit: "16kb"}))   //etna hi json data bhej sakte hn ekbaar main
app.use(express.urlencoded({extended: true, limit: "16kb"}))   // koe bhi url se  data dene ke liye ye likhte hn
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import upvoteRouter from "./routes/upvote.routes.js"
import issueRouter from "./routes/issue.routes.js";
import notificationRouter from "./routes/notification.routes.js"
import eventRouter from "./routes/event.routes.js"
import commentRouter from "./routes/comment.routes.js"
import attendanceRouter from "./routes/attendance.routes.js"
import analyticsRouter from "./routes/analytics.routes.js"
import emailRoutes from "./routes/email.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import sosAlertRoutes from "./routes/sosAlert.routes.js";
import otpRoutes from "./routes/otp.routes.js";


app.get("/api/health", async (req, res) => {
  try {

    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected");
    }

    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {

    res.status(500).json({
      status: "error",
      db: "disconnected",
      error: error.message,
    });

  }
});


//routes decleration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/otp", otpRoutes); 
app.use("/api/v1/upvotes", upvoteRouter)
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/events", eventRouter );
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/sos", sosAlertRoutes);





// http://localhost:8000/api/v1/users/register-- (example ase bhejna hn)

export { app }