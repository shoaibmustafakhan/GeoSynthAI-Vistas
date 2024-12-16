const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next(); // Add 'return' after calling next
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' }); // Add 'return' here
    }
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' }); // Add 'return' here
  }
};

module.exports = { protect };



