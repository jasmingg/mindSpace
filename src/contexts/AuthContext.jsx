import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { signOutRedirect } from '../utils/signOutRedirect';

const AuthStateContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const oidc = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: null,
    accessToken: null,
    idToken: null,
  });

  useEffect(() => {
    // update auth state when OIDC is ready
    if (!oidc.isLoading) {
      setAuthState({
        isAuthenticated: oidc.isAuthenticated,
        username: oidc.user?.profile?.['cognito:username'] || null,
        nickname: oidc.user?.profile?.nickname || null,
        accessToken: oidc.user?.access_token || null,
        idToken: oidc.user?.id_token || null,
      });
      setIsReady(true);
    }
  }, [oidc.isLoading, oidc.isAuthenticated, oidc.user]);

  useEffect(() => {
    if (!oidc?.events) return;

    // handle access token expiration
    const handleTokenExpired = () => {
      console.warn("Access token expired. Redirecting to logout...");
      signOutRedirect(oidc.userManager); // or use signOutRedirect(oidc.userManager) if using a custom util
    };

    oidc.events.addAccessTokenExpired(handleTokenExpired);

    // clean up on unmount
    return () => {
      oidc.events.removeAccessTokenExpired(handleTokenExpired);
    };
  }, [oidc]);

  return (
    <AuthStateContext.Provider value={{ ...authState, isReady }}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === null) {
    throw new Error('useAuthState must be used within AuthProvider');
  }
  return context;
};