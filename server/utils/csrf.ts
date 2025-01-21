import crypto from "crypto";

export const createCSRFToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
