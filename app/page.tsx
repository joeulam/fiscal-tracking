import React from 'react';
import { Button } from 'antd';
import Link from 'next/link';

const Home = () => (
  
  <div>
    Welcome
    
    <Button href={"/login"}type="primary">Login</Button>
    <Button type="primary">Sign up</Button>

  </div>
);

export default Home;