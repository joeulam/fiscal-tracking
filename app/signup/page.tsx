import React from 'react';
import { Button } from 'antd';



const signupPage = () => (
    <div>
    <h1>Welcome to the Login Page</h1>
    <p>Please sign up to continue</p>
    <Button type="primary">
      <a href="/api/auth/signup">signup</a>
    </Button>
  </div>
);

export default signupPage;