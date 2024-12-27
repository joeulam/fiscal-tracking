import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import { doesUserExist } from '../api/mongodb';
export default async function homePage() {
	const session = await getSession();
	const user = session?.user;
	await doesUserExist(user?.sub, user?.name, user?.email)

  return (
      user && (
          <div>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <a href="/api/auth/logout">Logout</a>
          </div>
      )
  );
}