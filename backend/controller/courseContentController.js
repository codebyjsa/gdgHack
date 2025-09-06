const { supabase } = require('../config/supabase');

// Create a new course content
const createCourseContent = async (req, res) => {
    try {
        const { course_id } = req.params;
        const { 
            content_type, 
            title, 
            body, 
            course_file_key 
        } = req.body;

        // Validate required fields
        if (!content_type) {
            return res.status(400).json({
                success: false,
                message: 'content_type is required'
            });
        }

        // Check if course exists
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('course_id')
            .eq('course_id', course_id)
            .single();

        if (courseError || !course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Create the course content
        const { data: contentData, error: contentError } = await supabase
            .from('course_contents')
            .insert([{
                course_id,
                content_type,
                title: title || null,
                body: body || null,
                course_file_key: course_file_key || null
            }])
            .select();

        if (contentError) throw contentError;

        res.status(201).json({
            success: true,
            message: 'Course content created successfully',
            data: contentData[0]
        });

    } catch (error) {
        console.error('Error in createCourseContent:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all contents for a course
const getCourseContents = async (req, res) => {
    try {
        const { course_id } = req.params;
        
        const { data, error } = await supabase
            .from('course_contents')
            .select('*')
            .eq('course_id', course_id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting course contents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course contents',
            error: error.message
        });
    }
};

// Get content by ID
const getContentById = async (req, res) => {
    try {
        const { content_id } = req.params;
        
        const { data, error } = await supabase
            .from('course_contents')
            .select('*')
            .eq('content_id', content_id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting content:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
};

// Update content
const updateContent = async (req, res) => {
    try {
        const { content_id } = req.params;
        const { 
            content_type, 
            title, 
            body, 
            course_file_key 
        } = req.body;

        const updates = {};
        if (content_type !== undefined) updates.content_type = content_type;
        if (title !== undefined) updates.title = title;
        if (body !== undefined) updates.body = body;
        if (course_file_key !== undefined) updates.course_file_key = course_file_key;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update'
            });
        }

        const { data, error } = await supabase
            .from('course_contents')
            .update(updates)
            .eq('content_id', content_id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Content updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating content',
            error: error.message
        });
    }
};

// Delete content
const deleteContent = async (req, res) => {
    try {
        const { content_id } = req.params;

        const { error } = await supabase
            .from('course_contents')
            .delete()
            .eq('content_id', content_id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting content',
            error: error.message
        });
    }
};

module.exports = {
    createCourseContent,
    getCourseContents,
    getContentById,
    updateContent,
    deleteContent
};
