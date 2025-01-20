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

// import express, { RequestHandler } from "express";
// import { googleLogin } from "../../controllers/googleauthController";
// import {
//   authenticateAdmin,
//   setSecureCookieOptions,
// } from "../../middleware/adminAuth";
// import logger from "../../../utils/logger";

// const router = express.Router();

// const getCurrentUser: RequestHandler = async (req, res) => {
//   try {
//     if (!req.adminuser) {
//       res.status(401).json({
//         error: "Authentication required",
//         code: "AUTH_REQUIRED",
//       });
//       return;
//     }

//     res.json({
//       id: req.adminuser._id,
//       adminemail: req.adminuser.adminemail,
//       adminname: req.adminuser.adminname,
//       adminrole: req.adminuser.adminrole,
//       profilePic: req.adminuser.profilePic,
//     });
//     return;
//   } catch (error) {
//     logger.error({
//       event: "get_current_user_error",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//     res.status(500).json({
//       error: "Internal server error",
//       code: "SERVER_ERROR",
//     });
//     return;
//   }
// };

// const logout: RequestHandler = (req, res) => {
//   try {
//     res.clearCookie("adminToken", setSecureCookieOptions());
//     logger.info({
//       event: "user_logout",
//       userId: req.adminuser?._id,
//     });
//     res.json({ message: "Logged out successfully" });
//   } catch (error) {
//     logger.error({
//       event: "logout_error",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//     res.status(500).json({
//       error: "Logout failed",
//       code: "LOGOUT_ERROR",
//     });
//   }
// };

// router.post("/google-login", googleLogin);
// router.get("/current-user", authenticateAdmin, getCurrentUser);
// router.post("/logout", authenticateAdmin, logout); // Add authentication check

// export default router;
