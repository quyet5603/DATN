import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const secret = process.env.JWT_SECRET || "atsjwtkey";

/**
 * Optional authentication middleware
 * Nếu có token thì xác thực và gán vào req, nếu không thì bỏ qua
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    // Remove "Bearer " prefix if present
    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    // Nếu không có token, bỏ qua (không báo lỗi)
    if (!token) {
      return next();
    }
    
    // Nếu có token, thử xác thực
    try {
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.token = token;
        req.userId = decoded.userId;
        req.user = user;
        console.log('[OptionalAuth] User authenticated:', user.userName);
      }
    } catch (authError) {
      // Nếu token không hợp lệ, bỏ qua (không báo lỗi)
      console.log('[OptionalAuth] Token invalid or expired, continuing without auth');
    }
    
    next();
  } catch (error) {
    // Nếu có lỗi khác, vẫn tiếp tục (không block request)
    console.error('[OptionalAuth] Error:', error.message);
    next();
  }
};

export { optionalAuthenticate };
