export function signOutRedirect(authInstance) {
  authInstance.removeUser(); // Clear OIDC state
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const logoutUri = "http://localhost:5173/";
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
}