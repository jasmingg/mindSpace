// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// oidc provider handles the actual Cognito login flow using your config
import { AuthProvider as OidcProvider } from "react-oidc-context";
// state provider centralizes auth state (isReady, isAuthenticated, username, tokens)
import { AuthProvider as StateProvider } from "./contexts/AuthContext";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_DzAZ9bugf",
  client_id: "4m10oprgt87khi0r60udgj69o0",
  redirect_uri: "http://localhost:5173/",
  response_type: "code",
  scope: "phone openid email profile"
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  // strictMode is a safety check: when page loads, API requests are sent twice to check for unsafe side effects
  <React.StrictMode>
    {/* first the OIDC provider with your Cognito config */}
{/*
      OidcProvider wraps the app and manages the Cognito login flow,
      using the provided cognitoAuthConfig for authority, client_id, etc.
    */}
    <OidcProvider {...cognitoAuthConfig}>
      {/*
        StateProvider sits inside the OidcProvider,
        reads useAuth() state once oidc is initialized,
        and exposes a clean, centralized auth state to the rest of the app
      */}
      <StateProvider>
        <App />
      </StateProvider>
    </OidcProvider>
  </React.StrictMode>
);