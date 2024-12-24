'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = false; // Replace with actual authentication check
    if (isAuthenticated) {
      // Redirect to homepage after login
      router.push('/homepage');
    }
  }, [router]);


  return (
    <div>
      <h1>Welcome to the Login Page</h1>
      <p>Please log in to continue</p>
      <Button type="primary">
        <a href="/api/auth/login">Login</a>
      </Button>
    </div>
  );
};

export default LoginPage;
