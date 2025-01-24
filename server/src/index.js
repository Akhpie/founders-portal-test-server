"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

const googleAuthRoutes = require("./routes/google-auth/googleAuthRoutes");
const adminRoutes = require("./routes/admin-routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/UserRoutes");
const twoFaRoutes = require("./routes/TwoFARoutes");
const checklistRoutes = require("./routes/checklistRoutes");
const faqRoutes = require("./routes/faqRoutes");
const visitorSecurityRoutes = require("./routes/visitor-routes/visitorSecurityRoutes");
const enhanceTextRoutes = require("./routes/enhanceTextRoutes");
const aiChatRoutes = require("./routes/AI-routes/aiChatRoutes");
const incubatorRoutes = require("./routes/incubator-routes/incubatorRoutes");
const AngelRoutes = require("./routes/angel-routes/AngelRoutes");
const preSeedRoutes = require("./routes/preSeed-routes/preSeedRoutes");
const seedRoutes = require("./routes/Seed-Routes/seedRoutes");
const templateRoutes = require("./routes/template-routes/templateRoutes");
const resourceRoutes = require("./routes/resource-routes/resourceRoutes");
const influencerRoutes = require("./routes/influencer-routes/influencerRoutes");
const StartupInfluencerRoutes = require("./routes/influencer-routes/StartupInfluencerRoutes");
const AdminPassRoutes = require("./routes/admin-pass-routes/AdminPassRoutes");

dotenv_1.default.config();

// Middleware
app.use(
  (0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Middleware to set the Access-Control-Allow-Credentials header
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express_1.default.json());
// Connect to Database
(0, db_1.default)();

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
app.use("/api/admin", AdminPassRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

exports.default = app;
