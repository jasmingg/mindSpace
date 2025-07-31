import { useState } from "react";
import { useAuth } from 'react-oidc-context';
import { useAuthState } from '../contexts/AuthContext';
import { signOutRedirect } from '../utils/signOutRedirect';
import log from "../utils/logger";

import anonProfilePic from '/anonymous-profile.png';
import "../styles/AccountMenu.css";

export default function AccountMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();
  const { isReady, isAuthenticated, username, nickname } = useAuthState();

  // returns the log in button functionality
  function logInButton () {
    log.info("User is not logged in");    //uncomment for debugging
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

// user is logged in: returns a drop-down for following actions: log out and account services
function logOutUI () {
  return (
        <div className="user-menu-container" 
    onMouseEnter={() => setMenuOpen(true)}
    onMouseLeave={() => setMenuOpen(false)}
    >
      <button className="profile-button">
        <img
          src="/anonymous-profile.png"
          alt="User profile"
          className="profile-picture"
        />
        <span className="profile-text">Hi, {nickname || username || "Welcome!"}</span>
      </button>

      {menuOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item"> {/* TODO: work on functionality for this button */}
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
