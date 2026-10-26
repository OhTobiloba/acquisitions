import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No access token provided'
      });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;
    
    logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
    next();
  } catch (e) {
    logger.error('Authentication error:', e);
    
    if (e.message === 'Failed to authenticate token') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Error during authentication'
    });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${allowedRoles.join(', ')}`);
        return res.status(403).json({
          error: 'Access denied',
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (e) {
      logger.error('Role verification error:', e);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Error during role verification'
      });
    }
  };
};


// ================================================
// import logger from '#config/logger.js';
// import { getUserById } from '#services/users.service.js';
// import cookies from '#utils/cookies.js';
// import jwttoken from '#utils/jwt.js';

// const requireAuth = async (req, res, next) => {
//   const token = cookies.get(req, 'token');
//   if (!token) {
//     return res.status(401).json({ error: 'Authentication required' });
//   }

//   let payload;
//   try {
//     payload = jwttoken.verify(token);
//   } catch {
//     return res.status(401).json({ error: 'Invalid or expired authentication token' });
//   }

//   if (!payload || typeof payload !== 'object' || !Number.isInteger(payload.id)) {
//     return res.status(401).json({ error: 'Invalid authentication token' });
//   }

//   try {
//     const user = await getUserById(payload.id);
//     if (!user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     req.user = user;
//     return next();
//   } catch (e) {
//     logger.error('Error loading authenticated user', e);
//     return next(e);
//   }
// };

// export default requireAuth;
