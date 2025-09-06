const { supabase, supabaseAdmin } = require('../config/supabase');

// Create a new educator
const createEducator = async (req, res) => {
    try {
        const { 
            email, 
            password,
            educator_name,
            bio,
            subjects,
            educator_photo_key
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

        // 2. Insert into educators table
        const { data: educatorData, error: educatorError } = await supabase
            .from('educators')
            .insert([{
                educator_id: userId,
                educator_name,
                bio,
                subjects: Array.isArray(subjects) ? subjects : [subjects].filter(Boolean),
                educator_photo_key,
                rating_sum: 0,
                rating_count: 0,
                follower_count: 0
            }])
            .select();

        if (educatorError) {
            // Rollback auth user creation if educator creation fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw educatorError;
        }

        // 3. Return success response
        res.status(201).json({
            success: true,
            message: 'Educator created successfully',
            data: educatorData[0]
        });

    } catch (error) {
        console.error('Error in createEducator:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

// Get all educators
const getEducators = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('educators')
            .select('*');

        if (error) throw error;

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting educators:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching educators',
            error: error.message
        });
    }
};

// Get educator by ID
const getEducatorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('educators')
            .select('*')
            .eq('educator_id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Educator not found'
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting educator:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching educator',
            error: error.message
        });
    }
};

// Update educator
const updateEducator = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            educator_name, 
            bio, 
            subjects, 
            educator_photo_key 
        } = req.body;

        const updates = {
            ...(educator_name && { educator_name }),
            ...(bio !== undefined && { bio }),
            ...(subjects && { 
                subjects: Array.isArray(subjects) ? subjects : [subjects].filter(Boolean) 
            }),
            ...(educator_photo_key && { educator_photo_key })
        };

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update'
            });
        }

        const { data, error } = await supabase
            .from('educators')
            .update(updates)
            .eq('educator_id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Educator updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating educator:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating educator',
            error: error.message
        });
    }
};

// Delete educator
const deleteEducator = async (req, res) => {
    try {
        const { id } = req.params;

        // First delete from auth users
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) throw authError;

        // Then delete from educators table
        const { error } = await supabase
            .from('educators')
            .delete()
            .eq('educator_id', id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: 'Educator deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting educator:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting educator',
            error: error.message
        });
    }
};

module.exports = {
    createEducator,
    getEducators,
    getEducatorById,
    updateEducator,
    deleteEducator
};
