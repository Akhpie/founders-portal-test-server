import { Router, Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const router = Router();

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const verifyAdminPasswordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;

    const inputHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const isValidPassword = crypto.timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(ADMIN_PASSWORD_HASH)
    );

    if (isValidPassword) {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "30m" });

      res.status(200).json({
        success: true,
        token,
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying admin password",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

router.post("/verify-admin-password", verifyAdminPasswordHandler);

export default router;
