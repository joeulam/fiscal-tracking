'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Make a call to your API to check login status
        const response = await fetch('/api/auth/me'); // Replace with your auth status endpoint
        if (response.ok) {
          const user = await response.json();
          if (user) {
            // Redirect to homepage if logged in
            router.push('/homepage');
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, [router]);

  const handleLogin = () => {
    // Redirect to OAuth login endpoint
    window.location.href = '/api/auth/login';
  };

  return (
    <div>
      <h1>Welcome to the Login Page</h1>
      <p>Please log in to access the application</p>
      <Button type="primary" onClick={handleLogin}>
        Login
      </Button>
    </div>
  );
};

export default LoginPage;
