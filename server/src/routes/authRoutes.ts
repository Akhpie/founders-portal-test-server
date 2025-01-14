import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { sendEmail } from "../../utils/SendEmail";
import speakeasy from "speakeasy";
import Visitor from "../models/Visitor";
import { Model } from "mongoose";
import {
  NotificationPreferences,
  NotificationSection,
  NotificationKey,
  UpdateNotificationRequest,
} from "../types/notifications";

const router = express.Router();
const loggedInUsers = new Map<string, LoggedInUser>();

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        require2FA?: boolean;
      };
    }
  }
}

interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface Session {
  userId: string;
  email: string;
  lastActive: Date;
  userAgent?: string;
  ipAddress?: string;
}

interface LoggedInUser {
  userId: string;
  email: string;
  fullName: string;
  userType: "founder" | "visitor";
  lastActive: Date;

  deviceInfo: string;
  twoFactorEnabled: boolean;
}

// In-memory session store (replace with Redis in production)
const activeSessions = new Map<string, Session>();

interface AuthenticatedRequest extends Request {
  user?: { userId: string }; // Define the expected type for `user` in the request
}

const registerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the incoming request body
    console.log("Received registration data:", req.body);

    const {
      fullName,
      email,
      password,
      phone,
      location,
      companyName,
      foundedYear,
      linkedinUrl,
      industry,
      companyDescription,
      currentStage,
    } = req.body;

    // Validate all required fields
    if (!fullName || !email || !password) {
      res.status(400).json({
        message: "Missing required fields",
        missing: {
          fullName: !fullName,
          email: !email,
          password: !password,
        },
      });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    if (phone) {
      const existingUserByPhone = await User.findOne({ phone });
      if (existingUserByPhone) {
        res.status(400).json({ message: "Phone number is already registered" });
        return;
      }
    }

    // Log password before hashing (for debugging, remove in production)
    // console.log("Password before hashing:", !!password);

    // Hash password with error handling
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      res.status(500).json({ message: "Error processing password" });
      return;
    }
    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      isVerified: false,
      phone: phone || "",
      location: location || "",
      foundedYear: foundedYear || "",
      linkedinUrl: linkedinUrl || "",
      companyName: companyName || "",
      industry: industry || "",
      companyDescription: companyDescription || "",
      currentStage: currentStage || "",
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    try {
      await sendEmail(
        email,
        "Verify your email",
        `<p>Click <a href="${verifyLink}">here</a> to confirm your email.</p>`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.status(500).json({ message: "Error sending email" });
      return;
    }

    res.status(201).json({
      message: "Please check your email for verification.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const verifyEmailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token not provided",
      });
      return;
    }

    // Log the token for debugging
    console.log("Verifying email with token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      userType?: "visitor";
    };

    console.log("Decoded token:", decoded);

    // Try to find the user in either collection based on the userType
    let user = await User.findById(decoded.userId);

    if (!user && decoded.userType === "visitor") {
      user = await Visitor.findById(decoded.userId);
    }

    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Update verification status
    user.isVerified = true;
    await user.save();

    console.log("User verified successfully:", decoded.userId);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);

    // Check if error is jwt related
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "An error occurred during verification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// !Login Handler

const getDeviceType = (userAgent: string): string => {
  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";
  if (/ipad/i.test(userAgent)) return "Tablet";
  return "Desktop";
};

const addToLoggedInUsers = (
  user: any,
  userType: "founder" | "visitor",
  userAgent: string
) => {
  const deviceInfo = getDeviceType(userAgent);

  loggedInUsers.set(user._id.toString(), {
    userId: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    userType,
    lastActive: new Date(),
    deviceInfo,
    twoFactorEnabled: user.twoFactorEnabled || false,
  });
};

const loginHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password, totpCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
      return;
    }

    if (user.twoFactorEnabled) {
      if (!user.twoFactorSecret) {
        console.error(
          "2FA is enabled but secret is missing for user:",
          user._id
        );
        res.status(500).json({
          success: false,
          message: "2FA configuration error",
        });
        return;
      }

      if (!totpCode) {
        const tempToken = jwt.sign(
          {
            userId: user._id,
            require2FA: true,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "5m" }
        );

        res.status(200).json({
          success: false,
          need2FA: true,
          tempToken,
          message: "2FA code required",
        });
        return;
      }

      const isValidTOTP = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: totpCode,
        window: 1,
      });

      if (!isValidTOTP) {
        res.status(400).json({
          success: false,
          message: "Invalid 2FA code",
        });
        return;
      }
    }

    // Create token and add to logged in users
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const userAgent = req.headers["user-agent"] || "Unknown Device";
    addToLoggedInUsers(user, "founder", userAgent);

    res.status(200).json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ! Logout handler

const logoutHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    try {
      // Decode token to get userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
        userType?: string;
      };

      // Important: Remove user from loggedInUsers Map
      loggedInUsers.delete(decoded.userId);

      // Remove from active sessions if you're using them
      if (activeSessions.has(token)) {
        activeSessions.delete(token);
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (jwtError) {
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to get active sessions for a user
export const getActiveSessionsForUser = (userId: string): Session[] => {
  return Array.from(activeSessions.values()).filter(
    (session) => session.userId === userId
  );
};

// Helper function to remove all sessions for a user
export const removeAllUserSessions = (userId: string): void => {
  for (const [token, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      activeSessions.delete(token);
    }
  }
};

const requestPasswordResetHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    // First try to find in User collection
    let user = await User.findOne({ email });
    let userType = "founder";

    // If not found in User collection, try Visitor collection
    if (!user) {
      user = await Visitor.findOne({ email });
      userType = "visitor";
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate a reset token with user type
    const resetToken = jwt.sign(
      {
        userId: user._id,
        userType: userType,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Generate password reset URL
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send email with the reset link
    await sendEmail(
      email,
      "Password Reset Request",
      `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending reset email",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const resetPasswordHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ message: "Token and new password are required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      userType?: "visitor";
    };

    // Find user in the appropriate collection
    let user;
    if (decoded.userType === "visitor") {
      user = await Visitor.findById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId);
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add the auth middleware
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

const getUserProfileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select(
      "fullName email phone companyDescription location companyName foundedYear linkedinUrl -_id"
    );

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateUserProfileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      fullName,
      phone,
      companyDescription,
      location,
      companyName,
      foundedYear,
      linkedinUrl,
    } = req.body;

    // Find and update the user's profile by userId
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      {
        fullName,
        phone,
        companyDescription,
        location,
        companyName,
        foundedYear,
        linkedinUrl,
      },
      {
        new: true,
        runValidators: true,
        select:
          "fullName email phone companyDescription location companyName foundedYear linkedinUrl -_id",
      }
    );

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const registerVisitorHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Received visitor registration data:", req.body);

    const {
      fullName,
      email,
      password,
      phone,
      location,
      companyWorkingAt,
      linkedinUrl,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      res.status(400).json({
        message: "Missing required fields",
        missing: {
          fullName: !fullName,
          email: !email,
          password: !password,
        },
      });
      return;
    }

    // Check if visitor exists
    // const existingVisitor = await Visitor.findOne({ email });
    // if (existingVisitor) {
    //   res.status(400).json({ message: "User already exists" });
    //   return;
    // }

    const [existingUserByEmail, existingVisitorByEmail] = await Promise.all([
      User.findOne({ email }),
      Visitor.findOne({ email }),
    ]);

    if (existingUserByEmail || existingVisitorByEmail) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    // Check if phone exists in both User and Visitor collections (only if phone is provided)
    if (phone) {
      const [existingUserByPhone, existingVisitorByPhone] = await Promise.all([
        User.findOne({ phone }),
        Visitor.findOne({ phone }),
      ]);

      if (existingUserByPhone || existingVisitorByPhone) {
        res.status(400).json({ message: "Phone number is already registered" });
        return;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new visitor
    const newVisitor = new Visitor({
      fullName,
      email,
      password: hashedPassword,
      isVerified: false,
      phone: phone || "",
      location: location || "",
      companyWorkingAt: companyWorkingAt || "",
      linkedinUrl: linkedinUrl || "",
    });

    await newVisitor.save();

    const token = jwt.sign(
      { userId: newVisitor._id, userType: "visitor" },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    try {
      await sendEmail(
        email,
        "Verify your email",
        `<p>Click <a href="${verifyLink}">here</a> to confirm your email.</p>`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.status(500).json({ message: "Error sending email" });
      return;
    }

    res.status(201).json({
      message: "Please check your email for verification.",
    });
  } catch (error) {
    console.error("Visitor registration error:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ! Visitor Login

const visitorLoginHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const visitor = await Visitor.findOne({ email });
    if (!visitor) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, visitor.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    if (!visitor.isVerified) {
      res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
      });
      return;
    }

    // Create token and add to logged in users
    const token = jwt.sign(
      {
        userId: visitor._id,
        userType: "visitor",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const userAgent = req.headers["user-agent"] || "Unknown Device";
    addToLoggedInUsers(visitor, "visitor", userAgent);

    res.status(200).json({
      success: true,
      token,
      userType: "visitor",
      message: "Login successful",
    });
  } catch (error) {
    console.error("Visitor login error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const visitorPasswordResetRequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    const visitor = await Visitor.findOne({ email });

    if (!visitor) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = jwt.sign(
      {
        userId: visitor._id,
        userType: "visitor",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&type=visitor`;

    await sendEmail(
      email,
      "Password Reset Request",
      `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error sending visitor password reset email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending reset email",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getVisitorProfileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const visitor = await Visitor.findById(req.user?.userId).select(
      "fullName email phone location companyWorkingAt linkedinUrl -_id"
    );

    if (!visitor) {
      res.status(404).json({ success: false, message: "Visitor not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    console.error("Error fetching visitor profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visitor profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateVisitorProfileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fullName, phone, location, companyWorkingAt, linkedinUrl } =
      req.body;

    const visitor = await Visitor.findByIdAndUpdate(
      req.user?.userId,
      {
        fullName,
        phone,
        location,
        companyWorkingAt,
        linkedinUrl,
      },
      {
        new: true,
        runValidators: true,
        select:
          "fullName email phone location companyWorkingAt linkedinUrl -_id",
      }
    );

    if (!visitor) {
      res.status(404).json({ success: false, message: "Visitor not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: visitor,
    });
  } catch (error) {
    console.error("Error updating visitor profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating visitor profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getCurrentlyLoggedInHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Clean up inactive users
    for (const [userId, userData] of loggedInUsers.entries()) {
      if (userData.lastActive < thirtyMinutesAgo) {
        loggedInUsers.delete(userId);
      }
    }

    const currentUsers = Array.from(loggedInUsers.values());
    const [foundersCount, visitorsCount] = await Promise.all([
      User.countDocuments({}),
      Visitor.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: currentUsers,
      totalUsers: foundersCount + visitorsCount,
    });
  } catch (error) {
    console.error("Error getting logged in users:", error);
    res.status(500).json({
      success: false,
      message: "Error getting logged in users",
    });
  }
};

const getNotificationPreferences = async (
  req: Request,
  res: Response<ApiResponse<NotificationPreferences>>
): Promise<void> => {
  try {
    const { userId } = req.user!;

    // Try to find in User collection first
    let user = await User.findById(userId);
    if (!user) {
      // If not found in User collection, try Visitor collection
      user = await Visitor.findById(userId);
    }

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notification preferences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateNotificationPreferences = async (
  req: Request<{}, {}, UpdateNotificationRequest>,
  res: Response<ApiResponse<NotificationPreferences>>
): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { section, key, value } = req.body;

    // Validate input types
    if (!section || !key || typeof value !== "boolean") {
      res.status(400).json({
        success: false,
        message: "Invalid request parameters",
      });
      return;
    }

    // Try to find in User collection first
    let user = await User.findById(userId);
    let userType = "founder";

    if (!user) {
      // If not found in User collection, try Visitor collection
      user = await Visitor.findById(userId);
      userType = "visitor";
    }

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Initialize notification preferences if they don't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        emailNotifications: {
          newOpportunities: false,
          newsletter: false,
          applicationUpdates: false,
          investorMessages: false,
        },
        systemNotifications: {
          taskReminders: false,
          deadlineAlerts: false,
          newsUpdates: false,
        },
      };
    }

    // Type guard to ensure the section exists
    if (!(section in user.notificationPreferences)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification section",
      });
      return;
    }

    // Type guard to ensure the key exists in the section
    const sectionPrefs =
      user.notificationPreferences[section as NotificationSection];
    if (!(key in sectionPrefs)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification key",
      });
      return;
    }

    // Type-safe update
    (user.notificationPreferences[section as NotificationSection] as any)[key] =
      value;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification preferences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Routes
router.post("/register", registerHandler);
router.get("/verify-email", verifyEmailHandler);
router.post("/login", loginHandler);
router.post("/logout", authMiddleware, logoutHandler);
router.post("/request-password-reset", requestPasswordResetHandler);
router.post("/reset-password", resetPasswordHandler);

router.get("/profile", authMiddleware, getUserProfileHandler);
router.put("/profile-update", authMiddleware, updateUserProfileHandler);

//* Visitor Routes
router.post("/register-visitor", registerVisitorHandler);
router.post("/visitor/login", visitorLoginHandler);
router.post(
  "/visitor/request-password-reset",
  visitorPasswordResetRequestHandler
);
router.get("/visitor/profile", authMiddleware, getVisitorProfileHandler);
router.put(
  "/visitor/profile-update",
  authMiddleware,
  updateVisitorProfileHandler
);

//* Founder Notification Routes
router.get("/notifications", authMiddleware, getNotificationPreferences);
router.put("/notifications", authMiddleware, updateNotificationPreferences);

//* Visitor Notification Routes
router.get(
  "/visitor/notifications",
  authMiddleware,
  getNotificationPreferences
);
router.put(
  "/visitor/notifications",
  authMiddleware,
  updateNotificationPreferences
);

router.get("/logged-in-users", getCurrentlyLoggedInHandler);

export default router;
