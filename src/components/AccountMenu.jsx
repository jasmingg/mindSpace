import { useState } from "react";
import "../styles/AccountMenu.css";
import { useAuth } from 'react-oidc-context';
import { useAuthState } from '../contexts/AuthContext';
import anonProfilePic from '../assets/anonymous-profile.png';
import { signOutRedirect } from '../utils/signOutRedirect';

export default function AccountMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();
  const { isReady, isAuthenticated, username, nickname } = useAuthState();

  // returns the log in button functionality
  function logInButton () {
    console.log("User is not logged in");
    if ( !isAuthenticated ) {
      // not logged in: show login button
      return (
        <button className="profile-button" onClick={() => auth.signinRedirect()}>
          <img
            src={anonProfilePic}
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
  console.log("User is logged in as:", nickname || username);
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
        <span className="profile-text">Hi, {nickname || username || "Welcome!"}</span>
      </button>

      {menuOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => alert("Go to Account Services")}>
            My Account
          </button>
          <button className="dropdown-item" onClick={() => signOutRedirect(auth)}>
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}
  return (
    <>
    {/* if auth state is ready, show either log in button or user menu */}
    {isReady ?  (isAuthenticated ? logOutUI() : logInButton()) : null}
    </>
  );
}
