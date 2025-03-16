
const jwt = require('jsonwebtoken');

// Middleware for role-based authentication
const auth = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Set user in request object
      req.user = decoded;
      
      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token is not valid' });
    }
  };
};

module.exports = auth;
