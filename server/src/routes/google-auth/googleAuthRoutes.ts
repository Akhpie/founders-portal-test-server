// import express, { RequestHandler } from "express";
// import { googleLogin } from "../../controllers/googleauthController";
// import { authenticateAdmin } from "../../middleware/adminAuth";

// const router = express.Router();

// // Get current user info
// const getCurrentUser: RequestHandler = (req, res) => {
//   res.json({
//     id: req.adminuser?._id,
//     adminemail: req.adminuser?.adminemail,
//     adminname: req.adminuser?.adminname,
//     adminrole: req.adminuser?.adminrole,
//     profilePic: req.adminuser?.profilePic,
//   });
// };

// // Logout handler
// const logout: RequestHandler = (req, res) => {
//   res.clearCookie("adminToken");
//   res.json({ message: "Logged out successfully" });
// };

// // Route definitions
// router.post("/google-login", googleLogin);
// router.get("/current-user", authenticateAdmin, getCurrentUser);
// router.post("/logout", logout);

// export default router;

import express, { RequestHandler } from "express";
import { googleLogin } from "../../controllers/googleauthController";
import { authenticateAdmin } from "../../middleware/adminAuth";
import cors from "cors";

const router = express.Router();

// CORS configuration specific to auth routes
const corsOptions = {
  origin: "https://founders-portal-test-server-client.onrender.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["set-cookie"],
};

// Apply CORS to all routes in this router
router.use(cors(corsOptions));

// Handle OPTIONS preflight requests
router.options("*", cors(corsOptions));

// Get current user info
const getCurrentUser: RequestHandler = (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://founders-portal-test-server-client.onrender.com"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.json({
    id: req.adminuser?._id,
    adminemail: req.adminuser?.adminemail,
    adminname: req.adminuser?.adminname,
    adminrole: req.adminuser?.adminrole,
    profilePic: req.adminuser?.profilePic,
  });
};

// Logout handler
const logout: RequestHandler = (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://founders-portal-test-server-client.onrender.com"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.clearCookie("adminToken");
  res.json({ message: "Logged out successfully" });
};

// Wrap the googleLogin handler to ensure CORS headers are set
const wrappedGoogleLogin: RequestHandler = async (req, res, next) => {
  try {
    res.header(
      "Access-Control-Allow-Origin",
      "https://founders-portal-test-server-client.onrender.com"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    await googleLogin(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Route definitions
router.post("/google-login", wrappedGoogleLogin);
router.get("/current-user", authenticateAdmin, getCurrentUser);
router.post("/logout", logout);

export default router;
