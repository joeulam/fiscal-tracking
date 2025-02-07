'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from 'antd';
import Image from 'next/image';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check login status from API
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const user = await response.json();
          if (user) {
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
    window.location.href = '/api/auth/login';
  };

  const handleSignup = () => {
    window.location.href = '/api/auth/signup';
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-black via-gray-900 to-black">
      {/* Card Container */}
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white border border-gray-300">
        {/* Logo Centered */}
        <div className="flex justify-center mb-4">
          <Image src={"/calicoName.png"} width={100} height={100} alt='company logo'/>
        </div>

        <h1 className="text-3xl font-bold text-black text-center">Welcome to Calico</h1>
        <p className="text-gray-600 text-center mb-6">A financial tracker</p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-6">
          <Button 
            type="primary" 
            onClick={handleLogin} 
            className="h-12 rounded-lg text-lg font-semibold bg-orange-500 hover:bg-orange-600 transition-all"
          >
            Login
          </Button>
          <Button 
            type="default" 
            onClick={handleSignup} 
            className="h-12 rounded-lg text-lg font-semibold border border-gray-400 text-black hover:border-gray-600 transition-all"
          >
            Signup
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
