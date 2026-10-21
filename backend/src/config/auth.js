export const JWT_COOKIE_NAME = "access_token";
export const JWT_ISSUER = "auth-app";
export const JWT_AUDIENCE = "auth-client";
export const JWT_EXPIRES_IN = "1h";
export const JWT_EXPIRES_IN_MS = 60 * 60 * 1000;

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must be set to a secret of at least 32 bytes.");
  }

  return secret;
};

export const getAuthCookieOptions = () => {
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  if (!["strict", "lax", "none"].includes(sameSite)) {
    throw new Error("COOKIE_SAME_SITE must be strict, lax, or none.");
  }

  const secure = process.env.NODE_ENV === "production" || sameSite === "none";
  if (sameSite === "none" && process.env.NODE_ENV !== "production") {
    throw new Error("COOKIE_SAME_SITE=none requires production HTTPS.");
  }

  return {
    secure,
    sameSite,
    httpOnly: true,
    path: "/",
    maxAge: JWT_EXPIRES_IN_MS,
  };
};

export const getClearAuthCookieOptions = () => {
  const options = getAuthCookieOptions();
  delete options.maxAge;
  return options;
};
