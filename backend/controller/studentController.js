const { supabase, supabaseAdmin } = require('../config/supabase');

// Create a new student
const createStudent = async (req, res) => {
    try {
        const { 
            email, 
            password,
            student_name,
            student_photo_key
        } = req.body;

        // 1. Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true // Auto-confirm the email
        });

        if (authError) {
            console.error('Error creating auth user:', authError);
            return res.status(400).json({ 
                success: false, 
                message: 'Error creating user', 
                error: authError.message 
            });
        }

        const userId = authData.user.id;

        // 2. Insert into students table
        const { data: studentData, error: studentError } = await supabase
            .from('students')
            .insert([{
                student_id: userId,
                student_name,
                student_photo_key: student_photo_key || null,
                enrolled_courses: 0,
                completed_courses: 0,
                following_count: 0
            }])
            .select();

        if (studentError) {
            // Rollback auth user creation if student creation fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw studentError;
        }

        // 3. Return success response
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: studentData[0]
        });

    } catch (error) {
        console.error('Error in createStudent:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

// Get all students
const getStudents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*');

        if (error) throw error;

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// Get student by ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student',
            error: error.message
        });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            student_name, 
            student_photo_key 
        } = req.body;

        const updates = {
            ...(student_name && { student_name }),
            ...(student_photo_key !== undefined && { student_photo_key })
        };

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update'
            });
        }

        const { data, error } = await supabase
            .from('students')
            .update(updates)
            .eq('student_id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // First delete from auth users
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) throw authError;

        // Then delete from students table
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('student_id', id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
};

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
