const { supabase, supabaseAdmin } = require('../config/supabase');

const getUsers = async (req, res) => {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    res.json(users);
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? err : null
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, user_metadata = {} } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        received: { email: !!email, password: '***' }
      });
    }

    // Check if user exists by listing all users and filtering by email
    try {
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error checking for existing user:', listError);
      } else if (data) {
        // Handle different possible response structures
        const usersList = Array.isArray(data) ? data : (data.users || []);
        const userExists = usersList.some(user => user && user.email === email);
        
        if (userExists) {
          return res.status(409).json({
            error: 'User already exists',
            email: email
          });
        }
      }
    } catch (error) {
      console.error('Error in user existence check:', error);
      // Continue with creation instead of failing
    }

    try {
      // Create user with all metadata in one go
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          ...user_metadata,
          created_at: new Date().toISOString()
        },
        app_metadata: {
          provider: 'email'
        }
      });

      if (signUpError) throw signUpError;
      
      if (!authData?.user) {
        throw new Error('Failed to create user: No user data returned from Supabase');
      }
      
      // Return the created user data
      return res.status(201).json({
        message: 'User created successfully',
        user: authData.user
      });
      
    } catch (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({ 
      error: err.message || 'Error creating user',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        code: err.code,
        status: err.status,
        details: err.details
      } : null
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        received: { email: !!email, password: '***' }
      });
    }

    // Sign in the user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        error: 'Invalid email or password',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }

    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return res.status(500).json({
        error: 'Failed to create session',
        details: process.env.NODE_ENV === 'development' ? sessionError?.message : null
      });
    }

    // Return the session data
    res.status(200).json({
      message: 'Login successful',
      user: data.user,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in
      }
    });

  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

module.exports = { getUsers, createUser, login };