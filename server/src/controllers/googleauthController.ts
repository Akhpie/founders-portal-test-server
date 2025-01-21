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

// import { Request, Response, RequestHandler } from "express";
// import { OAuth2Client } from "google-auth-library";
// import jwt from "jsonwebtoken";
// import { getLogger } from "../../utils/logger";
// import AdminUser, { IAdminUser } from "../models/AdminUser";
// import { config } from "../config/config";
// import { TokenPayload } from "../types/admin.types";
// import { createCSRFToken } from "../../utils/csrf";

// const client = new OAuth2Client(config.ADMIN_GOOGLE_CLIENT_ID);
// const logger = getLogger("GoogleAuthController");

// const createTokens = (payload: TokenPayload) => {
//   const accessToken = jwt.sign(payload, config.JWT_SECRET, {
//     expiresIn: config.AUTH.ACCESS_TOKEN_EXPIRY,
//   });

//   const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
//     expiresIn: config.AUTH.REFRESH_TOKEN_EXPIRY,
//   });

//   return { accessToken, refreshToken };
// };

// interface IAdminUserDocument extends IAdminUser {
//   tokenVersion?: number;
//   _id: string;
// }

// const setTokenCookies = (
//   res: Response,
//   accessToken: string,
//   refreshToken: string
// ) => {
//   res.cookie("adminToken", accessToken, {
//     httpOnly: true,
//     secure: config.NODE_ENV === "production",
//     sameSite: "strict",
//     domain: config.COOKIE_DOMAIN,
//     maxAge: 15 * 60 * 1000, // 15 minutes
//   });

//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: config.NODE_ENV === "production",
//     sameSite: "strict",
//     domain: config.COOKIE_DOMAIN,
//     maxAge: config.AUTH.COOKIE_MAX_AGE,
//   });
// };

// export const googleLogin: RequestHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { credential } = req.body;

//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: config.ADMIN_GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     if (!payload?.email || !payload?.name) {
//       logger.warn("Invalid Google token payload", { email: payload?.email });
//       res.status(400).json({ error: "Invalid token" });
//       return;
//     }

//     logger.info("Login attempt", { email: payload.email });

//     let adminUser = (await AdminUser.findOne({
//       adminemail: payload.email,
//     })) as IAdminUserDocument;

//     if (!adminUser) {
//       const isFirstAdmin = (await AdminUser.countDocuments({})) === 0;
//       if (!isFirstAdmin) {
//         logger.warn("Unauthorized login attempt", { email: payload.email });
//         res.status(403).json({ error: "Not authorized", isAdmin: false });
//         return;
//       }

//       adminUser = (await AdminUser.create({
//         adminemail: payload.email,
//         adminname: payload.name,
//         adminrole: "super_admin",
//         status: "active",
//         addedBy: "system",
//         dateAdded: new Date(),
//         profilePic: payload.picture,
//         tokenVersion: 0,
//       })) as IAdminUserDocument;

//       logger.info("Created first admin user", { id: adminUser._id });
//     }

//     if (adminUser.status !== "active") {
//       logger.warn("Inactive admin login attempt", { id: adminUser._id });
//       res.status(403).json({
//         error: "Your account is inactive. Please contact a super admin.",
//         isAdmin: false,
//       });
//       return;
//     }

//     // Update profile picture if changed
//     if (payload.picture !== adminUser.profilePic) {
//       adminUser = (await AdminUser.findByIdAndUpdate(
//         adminUser._id,
//         { profilePic: payload.picture },
//         { new: true }
//       )) as IAdminUserDocument;
//     }

//     const tokenPayload: TokenPayload = {
//       id: adminUser._id,
//       adminemail: adminUser.adminemail,
//       adminrole: adminUser.adminrole,
//       profilePic: adminUser.profilePic,
//       tokenVersion: adminUser.tokenVersion || 0,
//     };

//     const { accessToken, refreshToken } = createTokens(tokenPayload);
//     setTokenCookies(res, accessToken, refreshToken);

//     // Create and set CSRF token
//     const csrfToken = createCSRFToken();
//     res.cookie("XSRF-TOKEN", csrfToken, {
//       secure: config.NODE_ENV === "production",
//       sameSite: "strict",
//       domain: config.COOKIE_DOMAIN,
//     });

//     await AdminUser.findByIdAndUpdate(adminUser._id, {
//       lastLogin: new Date(),
//     });

//     logger.info("Successful login", { id: adminUser._id });

//     res.json({
//       isAdmin: true,
//       user: {
//         id: adminUser._id,
//         adminemail: adminUser.adminemail,
//         adminname: adminUser.adminname,
//         adminrole: adminUser.adminrole,
//         profilePic: adminUser.profilePic,
//       },
//     });
//   } catch (error) {
//     logger.error("Google login error", { error });
//     res.status(500).json({ error: "Authentication failed" });
//   }
// };

// export const refreshToken: RequestHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const token = req.cookies.refreshToken;
//     if (!token) {
//       res.status(401).json({ error: "Refresh token required" });
//       return;
//     }

//     const payload = jwt.verify(
//       token,
//       config.REFRESH_TOKEN_SECRET
//     ) as TokenPayload;
//     const adminUser = (await AdminUser.findById(
//       payload.id
//     )) as IAdminUserDocument;

//     if (!adminUser || adminUser.tokenVersion !== payload.tokenVersion) {
//       res.status(401).json({ error: "Invalid refresh token" });
//       return;
//     }

//     const newTokenPayload: TokenPayload = {
//       id: adminUser._id,
//       adminemail: adminUser.adminemail,
//       adminrole: adminUser.adminrole,
//       profilePic: adminUser.profilePic,
//       tokenVersion: adminUser.tokenVersion || 0,
//     };

//     const { accessToken, refreshToken } = createTokens(newTokenPayload);
//     setTokenCookies(res, accessToken, refreshToken);

//     res.json({ message: "Tokens refreshed" });
//   } catch (error) {
//     logger.error("Token refresh error", { error });
//     res.status(401).json({ error: "Invalid refresh token" });
//   }
// };
