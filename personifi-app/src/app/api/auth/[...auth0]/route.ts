import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: "/dashboard", // Redirect to dashboard after successful login
  }),
  signup: handleLogin({
    authorizationParams: {
      screen_hint: "signup", // Direct users to signup page
    },
    returnTo: "/dashboard",
  }),
});