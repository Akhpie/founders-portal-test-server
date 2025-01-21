import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { getLogger } from "../../utils/logger";

const logger = getLogger("CSRF");

export const createCSRFToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const validateCSRF = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const csrfToken =
      req.headers["x-xsrf-token"] || req.headers["x-csrf-token"];
    const cookieToken = req.cookies["XSRF-TOKEN"];

    if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
      logger.warn("CSRF token validation failed", {
        hasHeaderToken: !!csrfToken,
        hasCookieToken: !!cookieToken,
        match: csrfToken === cookieToken,
      });
      return res.status(403).json({ error: "Invalid CSRF token" });
    }

    next();
  } catch (error) {
    logger.error("CSRF validation error", { error });
    res.status(403).json({ error: "CSRF validation failed" });
  }
};
