import { useState } from "react";
import "../styles/AccountMenu.css";
import { useAuth } from 'react-oidc-context';

export default function AccountMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();

    // logged in: show "Hi, nickname" and dropdown menu
  const nickname = auth.user?.profile.nickname;


  // handles redirecting user to homepage after logging out and clearing user info from local session
  const signOutRedirect = () => {
    auth.removeUser();
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = "http://localhost:5173/";  // my local host port #, when running check your port #
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  // returns the log in button functionality
  function logInButton () {
    if (!auth.isAuthenticated ) {
      // not logged in: show login button
      return (
        <button className="profile-button" onClick={() => auth.signinRedirect()}>
          <img
            src="src/assets/anonymous-profile.png"
            alt="User profile"
            className="profile-picture"
          />
          <span className="profile-text">Log in</span>
        </button>
      );
    }
}

// returns a drop-down for following actions: log out and account services
function logOutUI () {
  return (
        <div className="user-menu-container" 
    onMouseEnter={() => setMenuOpen(true)}
    onMouseLeave={() => setMenuOpen(false)}
    >
      <button className="profile-button">
        <img
          src="src/assets/anonymous-profile.png"
          alt="User profile"
          className="profile-picture"
        />
        <span className="profile-text">Hi, {nickname}</span>
      </button>

      {menuOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => alert("Go to Account Services")}>
            My Account
          </button>
          <button className="dropdown-item" onClick={signOutRedirect}>
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}
  return (
    <>
    {auth.isLoading ? null : (auth.isAuthenticated ? logOutUI() : logInButton())}
    </>
  );
}
