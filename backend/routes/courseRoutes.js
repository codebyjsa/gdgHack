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
