import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AdminUser, { IAdminUser } from "../models/AdminUser";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      adminuser?: IAdminUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JwtPayload {
  adminemail: string;
  id: string;
  adminrole: string;
}

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.adminToken;
    console.log("Received token:", token ? "exists" : "missing");

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("Decoded token:", decoded);

    const adminUser = await AdminUser.findOne({
      adminemail: decoded.adminemail,
    });
    console.log("Found admin user:", adminUser ? "yes" : "no");

    if (!adminUser || adminUser.status !== "active") {
      res.status(403).json({ error: "Admin access denied" });
      return;
    }

    // Assign the admin user to request
    req.adminuser = adminUser;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid authentication" });
  }
};

export const isSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.adminuser || req.adminuser.adminrole !== "super_admin") {
    res.status(403).json({ error: "Super admin access required" });
    return;
  }
  next();
};

export const setSecureCookieOptions = () => ({
  httpOnly: true, // Prevents JavaScript access to the cookie
  secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
  sameSite: "strict" as const, // Protects against CSRF
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  path: "/", // Cookie is available for all paths
  domain: process.env.COOKIE_DOMAIN || undefined, // Optional domain setting
});

export const setCookie = (res: Response, token: string) => {
  res.cookie("adminToken", token, setSecureCookieOptions());
};

export const clearCookie = (res: Response) => {
  res.clearCookie("adminToken", setSecureCookieOptions());
};
