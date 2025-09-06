const express = require('express');
const router = express.Router();
const { 
    createStudent, 
    getStudents, 
    getStudentById, 
    updateStudent, 
    deleteStudent 
} = require('../controller/studentController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Create a new student (public endpoint for signup)
router.post('/createStudent', createStudent);

// Get all students (protected)
router.get('/getStudents', verifyJWT, getStudents);

// Get student by ID (protected)
router.get('/getStudentById/:id', verifyJWT, getStudentById);

// Update student (protected)
router.put('/updateStudent/:id', verifyJWT, updateStudent);

// Delete student (protected)
router.delete('/:id', verifyJWT, deleteStudent);

module.exports = router;
