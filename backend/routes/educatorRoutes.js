const express = require("express");
const router = express.Router();
const { 
    createEducator, 
    getEducators, 
    getEducatorById, 
    updateEducator, 
    deleteEducator 
} = require("../controller/educatorController");
const { verifyJWT } = require("../middleware/authMiddleware");

// Create a new educator (public endpoint for signup)
router.post("/createEducator", createEducator);

// Get all educators (protected)
router.get("/getEducators", verifyJWT, getEducators);

// Get educator by ID (protected)
router.get("/getEducatorById/:id", verifyJWT, getEducatorById);

// Update educator (protected)
router.put("/updateEducator/:id", verifyJWT, updateEducator);

// Delete educator (protected)
router.delete("/deleteEducator/:id", verifyJWT, deleteEducator);

module.exports = router;
