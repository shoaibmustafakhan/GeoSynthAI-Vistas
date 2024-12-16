// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select('-password');
//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// module.exports = { protect };
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


// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token;

//   // Check for authorization header and ensure it starts with 'Bearer'
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       // Extract the token
//       token = req.headers.authorization.split(' ')[1];

//       // Verify the token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Find the user in the database and attach to the request object
//       req.user = await User.findById(decoded.id).select('-password');
      
//       // Proceed to the next middleware or route
//       return next();
//     } catch (error) {
//       console.error('Token verification failed:', error);
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   // If no token is provided
//   if (!token) {
//     console.error('No token provided');
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// module.exports = { protect };

// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       // Verify the token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log("Decoded token:", decoded);

//       // Attach the user to the request
//       req.user = await User.findById(decoded.id).select("-password");
//       console.log("Authenticated user:", req.user);

//       next();
//     } catch (error) {
//       console.error("Token verification failed:", error);
//       return res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   } else {
//     console.error("No token provided");
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// module.exports = { protect };


