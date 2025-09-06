const express = require('express');
const router = express.Router();
const { getUsers, createUser, login } = require('../controller/usersController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Get all users
router.get('/', getUsers);

// Create new user (signup)
router.post('/createUser', createUser);

// User login
router.post('/login', login);

// Protected route example (requires valid JWT)
router.get('/profile', verifyJWT, (req, res) => {
  // req.user contains the authenticated user's information
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user
  });
});

module.exports = router;