import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, email, roles) => {
  const expires = process.env.JWT_EXPIRES_IN || process.env.ACCESS_TOKEN_EXPIRE || "15m";
  return jwt.sign({ id: userId, email, roles }, process.env.JWT_SECRET, {
    expiresIn: expires,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
