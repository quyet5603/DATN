/**
 * Middleware để kiểm tra phân quyền (Authorization)
 * Sử dụng sau middleware authenticate
 */

/**
 * Kiểm tra user có role cụ thể không
 * @param {...string} roles - Các role được phép
 * @returns {Function} Middleware function
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        // Kiểm tra đã authenticate chưa
        if (!req.user) {
            return res.status(401).json({ 
                status: 401,
                error: 'Unauthorized',
                message: 'Please login first' 
            });
        }
        
        // Kiểm tra role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 403,
                error: 'Forbidden',
                message: `Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
            });
        }
        
        next();
    };
};

/**
 * Middleware: Yêu cầu role admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware: Yêu cầu role employer hoặc admin
 */
export const requireEmployerOrAdmin = requireRole('employer', 'admin');

/**
 * Middleware: Yêu cầu role candidate hoặc admin
 */
export const requireCandidateOrAdmin = requireRole('candidate', 'admin');

/**
 * Kiểm tra user có phải admin hoặc owner của resource không
 * @param {Function} getOwnerId - Function để lấy ownerId từ request
 * @returns {Function} Middleware function
 */
export const requireAdminOrOwner = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                status: 401,
                error: 'Unauthorized' 
            });
        }
        
        // Admin có thể truy cập mọi thứ
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Kiểm tra ownership
        try {
            const ownerId = await getOwnerId(req);
            if (ownerId && ownerId.toString() === req.user._id.toString()) {
                return next();
            }
            
            return res.status(403).json({ 
                status: 403,
                error: 'Forbidden',
                message: 'You can only access your own resources' 
            });
        } catch (error) {
            return res.status(500).json({ 
                status: 500,
                error: 'Internal server error',
                message: error.message 
            });
        }
    };
};
