import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Initialize Supabase client with your project credentials
const supabase = createClient(
  'https://zlvebzyvvqglwqzphuow.supabase.co',
  'your-supabase-anon-key' // Replace with your actual anon key
);

const SupabaseLogin = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      
      // Redirect to profile after successful login
      if (session) {
        // Store the session in localStorage
        localStorage.setItem('accessToken', session.access_token);
        localStorage.setItem('refreshToken', session.refresh_token);
        
        // Redirect to profile page
        navigate('/profile');
      }
    });

    // Cleanup subscription on unmount
    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
          </div>
          <Auth 
            supabaseClient={supabase} 
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  },
                  space: {
                    spaceSmall: '0.5rem',
                    spaceMedium: '1rem',
                    spaceLarge: '1.5rem',
                  },
                  fontSizes: {
                    baseBodySize: '0.875rem',
                    baseInputSize: '0.875rem',
                    baseLabelSize: '0.875rem',
                  },
                },
              },
              className: {
                anchor: 'text-indigo-600 hover:text-indigo-500 text-sm font-medium',
                button: 'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                container: 'space-y-4',
                divider: 'relative my-6',
                dividerText: 'bg-white px-2 text-gray-500 text-sm',
                input: 'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
                label: 'block text-sm font-medium text-gray-700 mb-1',
                message: 'text-red-600 text-sm mt-1',
              },
            }}
            providers={['google', 'github']} // Enable social providers as needed
            redirectTo={window.location.origin}
          />
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Or use our <a href="/login" className="text-blue-600 hover:underline">custom login</a></p>
          </div>
        </div>
      </div>
    );
  }

  // This will redirect to profile due to the useEffect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
};

export default SupabaseLogin;
