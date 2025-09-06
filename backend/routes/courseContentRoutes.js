const express = require('express');
const router = express.Router();
const { 
    createCourseContent, 
    getCourseContents, 
    getContentById, 
    updateContent, 
    deleteContent 
} = require('../controller/courseContentController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Create content for a course (protected)
router.post('/createCourseContent/:course_id', verifyJWT, createCourseContent);

// Get all contents for a course (public)
router.get('/getCourseContents/:course_id', getCourseContents);

// Get specific content (public)
router.get('/getContentById/:content_id', getContentById);

// Update content (protected)
router.put('/updateContent/:content_id', verifyJWT, updateContent);

// Delete content (protected)
router.delete('/deleteContent/:content_id', verifyJWT, deleteContent);

module.exports = router;
