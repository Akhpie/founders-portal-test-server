import express, { Request, Response } from "express";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = express.Router();

const authMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("Backend received token:", token);

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    console.log("Decoded token:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get 2FA Status
const get2FAStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ enabled: user.twoFactorEnabled });
  } catch (error) {
    console.error("Error fetching 2FA status:", error);
    res.status(500).json({ message: "Error fetching 2FA status" });
  }
};

// Initialize 2FA Setup
const setup2FAHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `VentureFlow:${user.email}`,
    });
    user.twoFactorSecret = secret.base32;
    await user.save();

    res
      .status(200)
      .json({ secret: secret.base32, otpauthUrl: secret.otpauth_url });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    res.status(500).json({ message: "Error setting up 2FA" });
  }
};

// Verify and Enable 2FA
const verify2FASetupHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, secret } = req.body;
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
    });

    if (verified) {
      user.twoFactorEnabled = true;
      user.twoFactorSecret = secret;
      await user.save();
      res.status(200).json({ success: true });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }
  } catch (error) {
    console.error("Error verifying 2FA setup:", error);
    res.status(500).json({ message: "Error verifying 2FA setup" });
  }
};

// Disable 2FA
const disable2FAHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ message: "Error disabling 2FA" });
  }
};

// Update Password
const updatePasswordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password" });
  }
};

// DELETE USER

const deleteUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;

    // Get user ID from the authenticated request
    const userId = req.user?.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Verify password before allowing deletion
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User account successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Routes
router.get("/2fa-status", authMiddleware, get2FAStatusHandler);
router.post("/setup-2fa", authMiddleware, setup2FAHandler);
router.post("/verify-2fa-setup", authMiddleware, verify2FASetupHandler);
router.post("/disable-2fa", authMiddleware, disable2FAHandler);
router.post("/update-password", authMiddleware, updatePasswordHandler);

router.delete("/delete-account", authMiddleware, deleteUserHandler);

export default router;
