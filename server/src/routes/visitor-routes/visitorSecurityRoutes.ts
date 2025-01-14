import express, { Request, Response } from "express";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Visitor from "../../models/Visitor";

const router = express.Router();

// Reuse the same auth middleware
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
      userType: string;
    };
    console.log("Decoded token:", decoded);

    // Verify this is a visitor token
    if (decoded.userType !== "visitor") {
      res.status(403).json({ message: "Invalid user type for this endpoint" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Update Password for Visitor
const updateVisitorPasswordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  try {
    const visitor = await Visitor.findById(req.user?.userId);
    if (!visitor) {
      res.status(404).json({ message: "Visitor not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      visitor.password
    );
    if (!isPasswordValid) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    visitor.password = await bcrypt.hash(newPassword, 10);
    await visitor.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password" });
  }
};

// Delete Visitor Account
const deleteVisitorHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;
    const userId = req.user?.userId;

    const visitor = await Visitor.findById(userId);
    if (!visitor) {
      res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, visitor.password);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    await Visitor.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Visitor account successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting visitor:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting visitor account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Routes
router.post(
  "/visitor/update-password",
  authMiddleware,
  updateVisitorPasswordHandler
);
router.delete("/visitor/delete-account", authMiddleware, deleteVisitorHandler);

export default router;
