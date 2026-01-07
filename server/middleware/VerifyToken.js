import jwt from 'jsonwebtoken'
import User from '../models/User.js';
const secret = process.env.JWT_SECRET || "atsjwtkey"

const authenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        
        // Remove "Bearer " prefix if present
        if (token && token.startsWith('Bearer ')) {
            token = token.substring(7);
        }
        
        if (!token) {
            return res.status(401).json({status: 401, error: 'No token provided'});
        }
        
        const decoded = jwt.verify(token, secret);
        
        const user = await User.findById(decoded.userId);
        
        if (!user) {throw new Error("User not found")}
        
        req.token = token
        req.userId = decoded.userId
        req.user = user;

        next();
    } catch (error) {
        // Xử lý lỗi JWT expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 401,
                error: 'jwt expired',
                message: 'Token has expired. Please login again.'
            });
        }
        return res.status(401).json({
            status: 401,
            error: error.message || 'Authentication failed',
            name: error.name
        });
    }



}


export { authenticate}