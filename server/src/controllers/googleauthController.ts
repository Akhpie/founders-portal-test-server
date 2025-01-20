import { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser";

const client = new OAuth2Client(process.env.ADMIN_PRODUCTION_GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const googleLogin: RequestHandler = async (req, res, next) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.ADMIN_PRODUCTION_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    console.log("Login attempt for:", payload.email);

    // Get profile picture from Google
    const profilePic = payload.picture;

    // Simply check if this email exists as an admin
    let adminUser = await AdminUser.findOne({ adminemail: payload.email });

    // If no admin user found at all
    if (!adminUser) {
      const isFirstAdmin = (await AdminUser.countDocuments({})) === 0;
      if (isFirstAdmin) {
        adminUser = await AdminUser.create({
          adminemail: payload.email,
          adminname: payload.name,
          adminrole: "super_admin",
          status: "active",
          addedBy: "system",
          dateAdded: new Date(),
          profilePic: profilePic,
        });
      } else {
        res.status(403).json({
          error: "Not authorized",
          isAdmin: false,
        });
        return;
      }
    } else {
      // Update profile picture if it changed
      if (profilePic !== adminUser.profilePic) {
        const updatedAdmin = await AdminUser.findByIdAndUpdate(
          adminUser._id,
          { profilePic: profilePic },
          { new: true }
        );
        if (!updatedAdmin) {
          throw new Error("Failed to update admin user");
        }
        adminUser = updatedAdmin;
      }
    }

    // At this point, adminUser should definitely exist
    if (!adminUser) {
      throw new Error("Admin user not found after creation/update");
    }

    // Check status
    if (adminUser.status !== "active") {
      res.status(403).json({
        error: "Your account is inactive. Please contact a super admin.",
        isAdmin: false,
      });
      return;
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: adminUser._id,
        adminemail: adminUser.adminemail,
        adminrole: adminUser.adminrole,
        profilePic: profilePic,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login
    const updatedAdmin = await AdminUser.findByIdAndUpdate(
      adminUser._id,
      { lastLogin: new Date() },
      { new: true }
    );

    if (!updatedAdmin) {
      throw new Error("Failed to update last login");
    }

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      domain: ".onrender.com",
      path: "/",
    });

    res.json({
      isAdmin: true,
      user: {
        id: adminUser._id,
        adminemail: adminUser.adminemail,
        adminname: adminUser.adminname,
        adminrole: adminUser.adminrole,
        profilePic: profilePic,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Authentication failed" });
    return;
  }
};

// import { RequestHandler } from "express";
// import { OAuth2Client, TokenPayload } from "google-auth-library";
// import jwt from "jsonwebtoken";
// import AdminUser from "../models/AdminUser";
// import logger from "../../utils/logger";
// import { setSecureCookieOptions } from "../middleware/adminAuth";

// if (!process.env.ADMIN_GOOGLE_CLIENT_ID) {
//   throw new Error("ADMIN_GOOGLE_CLIENT_ID environment variable is required");
// }

// if (!process.env.JWT_SECRET) {
//   throw new Error("JWT_SECRET environment variable is required");
// }

// const client = new OAuth2Client(process.env.ADMIN_GOOGLE_CLIENT_ID);
// const JWT_SECRET = process.env.JWT_SECRET;

// export const googleLogin: RequestHandler = async (req, res) => {
//   try {
//     const { credential } = req.body;

//     if (!credential) {
//       res.status(400).json({
//         error: "Google credential required",
//         code: "MISSING_CREDENTIAL",
//       });
//       return;
//     }

//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.ADMIN_GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     if (!payload?.email || !payload.name) {
//       logger.warn({
//         event: "invalid_google_token",
//         error: "Missing required fields in payload",
//       });
//       res.status(400).json({
//         error: "Invalid token",
//         code: "INVALID_TOKEN",
//       });
//       return;
//     }

//     logger.info({
//       event: "google_login_attempt",
//       email: payload.email,
//     });

//     const profilePic = payload.picture;
//     let adminUser = await AdminUser.findOne({ adminemail: payload.email });

//     if (!adminUser) {
//       const isFirstAdmin = (await AdminUser.countDocuments({})) === 0;
//       if (!isFirstAdmin) {
//         logger.warn({
//           event: "unauthorized_login_attempt",
//           email: payload.email,
//         });
//         res.status(403).json({
//           error: "Not authorized",
//           code: "NOT_AUTHORIZED",
//           isAdmin: false,
//         });
//         return;
//       }

//       adminUser = await AdminUser.create({
//         adminemail: payload.email,
//         adminname: payload.name,
//         adminrole: "super_admin",
//         status: "active",
//         addedBy: "system",
//         dateAdded: new Date(),
//         profilePic: profilePic,
//       });

//       logger.info({
//         event: "first_admin_created",
//         email: payload.email,
//       });
//     }

//     if (profilePic !== adminUser.profilePic) {
//       adminUser = await AdminUser.findByIdAndUpdate(
//         adminUser._id,
//         { profilePic: profilePic },
//         { new: true }
//       );

//       if (!adminUser) {
//         throw new Error("Failed to update admin user");
//       }
//     }

//     if (adminUser.status !== "active") {
//       logger.warn({
//         event: "inactive_account_login_attempt",
//         email: payload.email,
//       });
//       res.status(403).json({
//         error: "Your account is inactive",
//         code: "INACTIVE_ACCOUNT",
//         isAdmin: false,
//       });
//       return;
//     }

//     const token = jwt.sign(
//       {
//         id: adminUser._id,
//         adminemail: adminUser.adminemail,
//         adminrole: adminUser.adminrole,
//         profilePic: profilePic,
//       },
//       JWT_SECRET,
//       {
//         expiresIn: "24h",
//         algorithm: "HS256",
//       }
//     );

//     await AdminUser.findByIdAndUpdate(
//       adminUser._id,
//       {
//         lastLogin: new Date(),
//         lastLoginIP: req.ip,
//       },
//       { new: true }
//     );

//     res.cookie("adminToken", token, setSecureCookieOptions());

//     logger.info({
//       event: "login_successful",
//       userId: adminUser._id,
//       email: adminUser.adminemail,
//     });

//     const response = {
//       isAdmin: true,
//       user: {
//         id: adminUser._id,
//         adminemail: adminUser.adminemail,
//         adminname: adminUser.adminname,
//         adminrole: adminUser.adminrole,
//         profilePic: profilePic,
//       },
//     };

//     res.json(response);
//   } catch (error) {
//     logger.error({
//       event: "google_login_error",
//       error: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//     });

//     res.status(500).json({
//       error: "Authentication failed",
//       code: "AUTH_FAILED",
//     });
//   }
// };
