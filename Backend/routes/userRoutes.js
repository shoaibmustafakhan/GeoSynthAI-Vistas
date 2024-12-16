const express = require('express');
const { registerUser, authUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Authenticate user (login)
router.post('/login', authUser);

// Get user profile (requires authentication)
router.get('/profile', protect, getUserProfile);

// Update user profile (requires authentication)
router.put('/profile', protect, updateUserProfile);

module.exports = router;
