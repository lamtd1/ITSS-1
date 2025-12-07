import { verifyAccessToken } from "../utils/jwt-utils.js";

export const authenticate = (req, res, next) => {
  try {
    // 1. Lấy token từ HEADER
    // Client sẽ gửi: Authorization: Bearer <token>
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 2. Verify Token
    const decoded = verifyAccessToken(token); 

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 3. Gán thông tin user vào request
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.some(role => allowedRoles.includes(role))) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user ? req.user.roles : 'None'} is not authorized to access this resource`,
      });
    }
    next();
  };
};