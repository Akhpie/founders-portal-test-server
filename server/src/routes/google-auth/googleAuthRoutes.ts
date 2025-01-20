// import express, { RequestHandler } from "express";
// import { googleLogin } from "../../controllers/googleauthController";
// import { authenticateAdmin } from "../../middleware/adminAuth";

// const router = express.Router();
// const FRONTEND_URL = "https://founders-portal-test-server-client.onrender.com";

// // Get current user info
// const getCurrentUser: RequestHandler = (req, res) => {
//   res.header("Access-Control-Allow-Origin", FRONTEND_URL);
//   res.header("Access-Control-Allow-Credentials", "true");
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
//   res.header("Access-Control-Allow-Origin", FRONTEND_URL);
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.clearCookie("adminToken", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "none",
//   });
//   res.json({ message: "Logged out successfully" });
// };

// // Wrap googleLogin to ensure proper headers
// const wrappedGoogleLogin: RequestHandler = async (req, res, next) => {
//   console.log("Google login request received");
//   try {
//     const origin = req.headers.origin;
//     if (origin === FRONTEND_URL) {
//       res.header("Access-Control-Allow-Origin", FRONTEND_URL);
//       res.header("Access-Control-Allow-Credentials", "true");
//     }
//     await googleLogin(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// };

// // Route definitions
// router.post("/google-login", wrappedGoogleLogin);
// router.get("/current-user", authenticateAdmin, getCurrentUser);
// router.post("/logout", logout);

// export default router;

import express, { RequestHandler } from "express";
import { googleLogin } from "../../controllers/googleauthController";
import { authenticateAdmin } from "../../middleware/adminAuth";

const router = express.Router();

// Get current user info
const getCurrentUser: RequestHandler = (req, res) => {
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
  res.clearCookie("adminToken");
  res.json({ message: "Logged out successfully" });
};

// Route definitions
router.post("/google-login", googleLogin);
router.get("/current-user", authenticateAdmin, getCurrentUser);
router.post("/logout", logout);

export default router;
