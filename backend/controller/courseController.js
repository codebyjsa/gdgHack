const { supabase } = require('../config/supabase');

// Create a new course
const createCourse = async (req, res) => {
    try {
        const { 
            educator_id,
            title,
            description,
            price,
            course_cover_image_key,
            is_published = true
        } = req.body;

        // Validate required fields
        if (!educator_id || !title || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'educator_id, title, and price are required fields'
            });
        }

        // Check if educator exists
        const { data: educator, error: educatorError } = await supabase
            .from('educators')
            .select('educator_id')
            .eq('educator_id', educator_id)
            .single();

        if (educatorError || !educator) {
            return res.status(404).json({
                success: false,
                message: 'Educator not found'
            });
        }

        // Create the course
        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .insert([{
                educator_id,
                title,
                description: description || null,
                price: parseFloat(price),
                course_cover_image_key: course_cover_image_key || null,
                is_published: Boolean(is_published)
            }])
            .select();

        if (courseError) throw courseError;

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: courseData[0]
        });

    } catch (error) {
        console.error('Error in createCourse:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all courses (with optional filtering)
const getCourses = async (req, res) => {
    try {
        const { educator_id, is_published } = req.query;
        
        let query = supabase
            .from('courses')
            .select('*');

        if (educator_id) {
            query = query.eq('educator_id', educator_id);
        }
        
        if (is_published !== undefined) {
            query = query.eq('is_published', is_published === 'true');
        }

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
};

// Get course by ID
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                educators:educator_id (educator_name, educator_photo_key)
            `)
            .eq('course_id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course',
            error: error.message
        });
    }
};

// Update course
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            price, 
            course_cover_image_key, 
            is_published 
        } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = parseFloat(price);
        if (course_cover_image_key !== undefined) updates.course_cover_image_key = course_cover_image_key;
        if (is_published !== undefined) updates.is_published = Boolean(is_published);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update'
            });
        }

        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('course_id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course',
            error: error.message
        });
    }
};

// Delete course
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('course_id', id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};
