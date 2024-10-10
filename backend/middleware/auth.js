const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  console.log('User in isAdmin middleware:', req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('Access denied. User role:', req.user ? req.user.role : 'undefined');
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

module.exports = { authenticate, isAdmin };