const express = require('express');
const router = express.Router();
const { 
    createCourse, 
    getCourses, 
    getCourseById, 
    updateCourse, 
    deleteCourse 
} = require('../controller/courseController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Handle OPTIONS for CORS preflight
router.options('/createCourse', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
});

// Create a new course (protected)
router.post('/createCourse', verifyJWT, createCourse);

// Get all courses (public)
router.get('/getCourses', getCourses);

// Get course by ID (public)
router.get('/getCourseById/:id', getCourseById);

// Update course (protected)
router.put('/updateCourse/:id', verifyJWT, updateCourse);

// Delete course (protected)
router.delete('/deleteCourse/:id', verifyJWT, deleteCourse);

module.exports = router;
