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
