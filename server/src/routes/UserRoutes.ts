import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import speakeasy from "speakeasy";
import Visitor from "../models/Visitor";
import { sendBulkEmail, sendEmail } from "../../utils/SendEmail";

const router = express.Router();

const getLoggedInUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all users with valid tokens
    const founders = await User.find({ isVerified: true }).select(
      "fullName email userType"
    );
    const visitors = await Visitor.find({ isVerified: true }).select(
      "fullName email userType"
    );

    // Combine users with their types
    const allUsers = [
      ...founders.map((f) => ({ ...f.toObject(), userType: "founder" })),
      ...visitors.map((v) => ({ ...v.toObject(), userType: "visitor" })),
    ];

    res.status(200).json({
      success: true,
      data: allUsers,
      totalUsers: allUsers.length,
    });
  } catch (error) {
    console.error("Error getting logged-in users:", error);
    res.status(500).json({
      success: false,
      message: "Error getting logged-in users",
    });
  }
};

// Profile Handlers
const getAllFoundersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch users with selected fields, excluding sensitive info
    const users = await User.find({}).select(
      "fullName email isVerified twoFactorEnabled phone location companyName foundedYear linkedinUrl industry companyDescription currentStage -_id"
    );

    // Check if no users found
    if (users.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "No users found",
      });
      return;
    }

    // Respond with users
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    // Log and respond with error
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// !DELETE USER

const deleteUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Delete the user
    await User.deleteOne({ email });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// !EDIT USER
interface UpdateUserFields {
  fullName?: string;
  phone?: string;
  location?: string;
  companyName?: string;
  foundedYear?: number;
  linkedinUrl?: string;
  industry?: string;
  companyDescription?: string;
  currentStage?: string;
}

const updateUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;
    const updateFields: UpdateUserFields = req.body;

    // Validate if email exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Remove any sensitive fields that shouldn't be updated
    const sanitizedFields = { ...updateFields };
    delete (sanitizedFields as any).email; // Prevent email updates
    delete (sanitizedFields as any).password;
    delete (sanitizedFields as any).isVerified;
    // delete (sanitizedFields as any).twoFactorEnabled;

    // Validate the fields
    const allowedFields = [
      "fullName",
      "phone",
      "location",
      "companyName",
      "foundedYear",
      "linkedinUrl",
      "industry",
      "companyDescription",
      "currentStage",
      "twoFactorEnabled",
    ];

    // Check if all update fields are allowed
    const invalidFields = Object.keys(sanitizedFields).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid fields detected: ${invalidFields.join(", ")}`,
      });
      return;
    }

    // Update the user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: sanitizedFields },
      { new: true, runValidators: true }
    ).select("-password -_id");

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found or update failed",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// !SETUP 2FA

const setupTwoFactorHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Generate a secret for 2FA
    const secret = speakeasy.generateSecret({
      name: "Admin Dashboard",
    });

    res.status(200).json({
      success: true,
      data: {
        otpauth_url: secret.otpauth_url,
        secret: secret.base32,
      },
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to setup 2FA",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// !Verify 2FA token
const verifyTwoFactorHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, secret } = req.body;

    // Verify the token with the secret
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 1,
    });

    res.status(200).json({
      success: verified,
      message: verified ? "Verification successful" : "Invalid code",
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getAllUsersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch founders
    const founders = await User.find({}).select(
      "fullName email isVerified twoFactorEnabled phone location companyName foundedYear linkedinUrl industry companyDescription currentStage userType notificationPreferences -_id"
    );

    // Fetch visitors
    const visitors = await Visitor.find({}).select(
      "fullName email isVerified phone location companyWorkingAt linkedinUrl userType notificationPreferences -_id"
    );

    // Add userType to each record
    const foundersWithType = founders.map((f) => ({
      ...f.toObject(),
      userType: "founder",
    }));
    const visitorsWithType = visitors.map((v) => ({
      ...v.toObject(),
      userType: "visitor",
    }));

    // Combine all users
    const allUsers = [...foundersWithType, ...visitorsWithType];

    // Check if no users found
    if (allUsers.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "No users found",
      });
      return;
    }

    // Respond with users
    res.status(200).json({
      success: true,
      count: allUsers.length,
      data: allUsers,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// * To RETRIEVE all Visitors
const getAllVisitorsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch visitors with selected fields, excluding sensitive info
    const visitors = await Visitor.find({}).select(
      "fullName email isVerified phone location companyWorkingAt linkedinUrl userType -_id"
    );

    // Check if no visitors found
    if (visitors.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "No visitors found",
      });
      return;
    }

    // Add userType to each visitor
    const visitorsWithType = visitors.map((v) => ({
      ...v.toObject(),
      userType: "visitor",
    }));

    // Respond with visitors
    res.status(200).json({
      success: true,
      count: visitorsWithType.length,
      data: visitorsWithType,
    });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching visitors",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const resetUserTwoFactorHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Reset 2FA settings
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA reset successfully",
    });
  } catch (error) {
    console.error("Error resetting 2FA:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting 2FA",
    });
  }
};

const getUserGrowthHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const visitorsGrowth = await Visitor.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        founders: usersGrowth,
        visitors: visitorsGrowth,
      },
    });
  } catch (error) {
    console.error("Error getting user growth:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user growth",
    });
  }
};

const getUserNotificationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;

    // Try to find in User collection first
    let user = await User.findOne({ email });
    let userType = "founder";

    if (!user) {
      // If not found in User collection, try Visitor collection
      user = await Visitor.findOne({ email });
      userType = "visitor";
    }

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.notificationPreferences || {
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
      },
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

const sendBulkEmailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { recipients, subject, content } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({
        success: false,
        message: "No recipients provided",
      });
      return;
    }

    if (!subject || !content) {
      res.status(400).json({
        success: false,
        message: "Subject and content are required",
      });
      return;
    }

    const results = await sendBulkEmail(recipients, subject, content);

    res.status(200).json({
      success: true,
      message: `Emails sent successfully to ${results.successful.length} recipients`,
      results: {
        successful: results.successful.length,
        failed: results.failed.length,
        failedEmails: results.failed,
      },
    });
  } catch (error) {
    console.error("Error sending bulk email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send emails",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createNewsletterTemplate = (subject: string, content: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        /* Reset styles */
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }

        /* Container */
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }

        /* Header */
        .header {
          text-align: center;
          padding: 30px 0;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 8px 8px 0 0;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }

        /* Content */
        .content {
          padding: 20px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        /* Footer */
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 0 0 8px 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .footer p {
          margin: 5px 0;
        }

        .unsubscribe-link {
          color: #6366f1;
          text-decoration: none;
        }

        /* Responsive images */
        img {
          max-width: 100%;
          height: auto;
        }

        /* Button styles */
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4f46e5;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 15px 0;
        }

        /* Divider */
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 25px 0;
        }

        /* Social Links */
        .social-links {
          text-align: center;
          padding: 15px 0;
        }

        .social-links a {
          margin: 0 10px;
          color: #6b7280;
          text-decoration: none;
        }

        /* Logo */
        .logo {
          max-height: 50px;
          margin-bottom: 15px;
        }

        /* Media queries */
        @media screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            padding: 10px !important;
          }

          .content {
            padding: 15px !important;
          }

          .header {
            padding: 20px 0 !important;
          }

          .header h1 {
            font-size: 24px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- Replace with your logo URL -->
          <img src="your-logo-url.png" alt="Company Logo" class="logo">
          <h1>${subject}</h1>
        </div>

        <div class="content">
          ${content}
        </div>

        <div class="divider"></div>

        <div class="social-links">
          <a href="#">Twitter</a> |
          <a href="#">LinkedIn</a> |
          <a href="#">Facebook</a>
        </div>

        <div class="footer">
          <p>Thank you for subscribing to our newsletter!</p>
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          <p>
            You received this email because you're subscribed to our updates.
            <br>
            <a href="#" class="unsubscribe-link">Update your preferences</a> or <a href="#" class="unsubscribe-link">unsubscribe</a>
          </p>
          <p>Your Company Address, City, Country</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendNewsletterHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { recipients, subject, content } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({
        success: false,
        message: "No recipients provided",
      });
      return;
    }

    // Create newsletter HTML using the template
    const newsletterHtml = createNewsletterTemplate(subject, content);

    // Send newsletter
    await Promise.all(
      recipients.map((email) => sendEmail(email, subject, newsletterHtml))
    );

    res.status(200).json({
      success: true,
      message: `Newsletter sent successfully to ${recipients.length} subscribers`,
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send newsletter",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//! NewsLetter Route
router.post("/send-newsletter", sendNewsletterHandler);

//! Email Route
router.post("/send-email", sendBulkEmailHandler);

// !Notifications Route
router.get("/notifications/:email", getUserNotificationsHandler);

// !All user Routes
router.get("/all-users", getAllUsersHandler);

// !All Founder Routes
router.get("/all-visitors", getAllVisitorsHandler);

// !Founder Routes
router.get("/all-founders", getAllFoundersHandler);
router.delete("/delete/:email", deleteUserHandler);
router.patch("/update/:email", updateUserHandler);
router.post("/setup-2fa", setupTwoFactorHandler);
router.post("/verify-2fa", verifyTwoFactorHandler);

// !USER ACTIVITY Routes
router.get("/logged-in-users", getLoggedInUsers);

router.post("/reset-2fa/:userId", resetUserTwoFactorHandler);
router.get("/user-growth", getUserGrowthHandler);

export default router;
