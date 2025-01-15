import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/UserRoutes";
import twoFaRoutes from "./routes/TwoFARoutes";
import enhanceTextRoutes from "./routes/enhanceTextRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import faqRoutes from "./routes/faqRoutes";
import visitorSecurityRoutes from "./routes/visitor-routes/visitorSecurityRoutes";
import aiChatRoutes from "./routes/AI-routes/aiChatRoutes";
import incubatorRoutes from "./routes/incubator-routes/incubatorRoutes";
import resourceRoutes from "./routes/resource-routes/resourceRoutes";
import path from "path";
import templateRoutes from "./routes/template-routes/templateRoutes";
import adminRoutes from "./routes/admin-routes/adminRoutes";
import cookieParser from "cookie-parser";
import googleAuthRoutes from "./routes/google-auth/googleAuthRoutes";
import influencerRoutes from "./routes/influencer-routes/influencerRoutes";
import StartupInfluencerRoutes from "./routes/influencer-routes/StartupInfluencerRoutes";
import AngelRoutes from "./routes/angel-routes/AngelRoutes";
import preSeedRoutes from "./routes/preSeed-routes/preSeedRoutes";
import seedRoutes from "./routes/Seed-Routes/seedRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cookieParser());

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://founders-portal-test-server-5eyl.vercel.app/",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", googleAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/twofa", twoFaRoutes);
app.use("/api/check", checklistRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api", visitorSecurityRoutes);

app.use("/api/ai", enhanceTextRoutes);
app.use("/api/ai-chat", aiChatRoutes);

app.use("/api", incubatorRoutes);
app.use("/api", AngelRoutes);
app.use("/api", preSeedRoutes);
app.use("/api", seedRoutes);

app.use("/api", templateRoutes);

app.use("/api/resources", resourceRoutes);
app.use("/api/influencers", influencerRoutes);
app.use("/api/startup-influencers", StartupInfluencerRoutes);

app.use("/resuploads", (req, res, next) => {
  // Check if it's a download request
  if (req.query.download === "true") {
    // Set headers for download
    res.setHeader("Content-Disposition", "attachment");
  }
  next();
});

app.use("/resuploads", express.static(path.join(__dirname, "Resuploads")));

if (process.env.NODE_ENV === "development") {
  app.get("/api/debug/routes", (req, res) => {
    const routes = app._router.stack
      .filter((r: any) => r.route)
      .map((r: any) => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods),
      }));
    res.json(routes);
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
