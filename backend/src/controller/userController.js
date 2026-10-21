import { User } from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  getClearAuthCookieOptions,
  getAuthCookieOptions,
  getJwtSecret,
  JWT_AUDIENCE,
  JWT_COOKIE_NAME,
  JWT_ISSUER,
  JWT_EXPIRES_IN,
} from "../config/auth.js";

export const userController = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const hashedPassword = /^\$2[aby]\$/.test(user.password);
    const passwordMatches = hashedPassword
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!passwordMatches) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!hashedPassword) {
      user.password = await bcrypt.hash(password, 12);
      await user.save();
    }

    const token = jwt.sign({}, getJwtSecret(), {
      algorithm: "HS256",
      audience: JWT_AUDIENCE,
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
      subject: String(user._id),
    });

    return res
      .cookie(JWT_COOKIE_NAME, token, getAuthCookieOptions())
      .status(200)
      .json({
        message: "Login successful",
        user: { id: String(user._id), email: user.email },
      });
  } catch (error) {
    console.error("Login query failed:", error.name, error.code ?? "unknown");
    return res
      .status(503)
      .json({ message: "Login service is temporarily unavailable" });
  }
};

export const currentUserController = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.userId).select("_id email");

    if (!user) {
      res.clearCookie(JWT_COOKIE_NAME, getClearAuthCookieOptions());
      return res.status(401).json({ message: "Account no longer exists" });
    }

    return res.status(200).json({
      user: { id: String(user._id), email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutController = (_req, res) =>
  res
    .clearCookie(JWT_COOKIE_NAME, getClearAuthCookieOptions())
    .status(200)
    .json({ message: "Logged out" });
