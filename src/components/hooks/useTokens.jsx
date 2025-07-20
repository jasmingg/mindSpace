
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

// important hook that provides any jsx file with secure access to access and id tokens
export default function useTokens() {
  //useAuth() is a hook that provides everything related to OIDC authentication (ie auth.user gets )
  const auth = useAuth();

  // runs when auth.user (user info) changes (signing out or logging in) 
  useEffect(() => {
    // if user exists (is logged in) save token to localStorage
    if (auth.user?.access_token) {
      localStorage.setItem("access_token", auth.user.access_token);
      localStorage.setItem("id_token", auth.user.id_token);
    }
    else {
    // remove tokens when the user logs out (aka auth.user is falsy)
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
  }
     // auth.user provides a OIDC user object (contains tokens + user profile)
  }, [auth.user]);

  return {
    accessToken: auth.user?.access_token || localStorage.getItem("access_token"),
    idToken: auth.user?.id_token || localStorage.getItem("id_token"),
  };
}