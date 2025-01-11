// app/api/auth/[auth0]/route.js
import { handleAuth,handleLogin } from '@auth0/nextjs-auth0';

export const GET = await handleAuth({ 
    login: handleLogin({returnTo: "/homepage"}),
    signup: handleLogin({ authorizationParams: { screen_hint: 'signup' } })
});

