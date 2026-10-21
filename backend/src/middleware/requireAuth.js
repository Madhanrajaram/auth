import jwt from "jsonwebtoken";
import {
  getJwtSecret,
  JWT_AUDIENCE,
  JWT_ISSUER,
} from "../config/auth.js";

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    });

    if (typeof payload === "string" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.auth = { userId: payload.sub };
    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    return next(error);
  }
};
