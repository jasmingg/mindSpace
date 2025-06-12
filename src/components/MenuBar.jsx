import React from "react";
import "../styles/HomePage.css";
import AccountMenu from "./AccountMenu"
import { Link, useLocation } from 'react-router-dom';

const MenuBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="menu-bar">
      {/* NavBar */}
      <nav className="navbar">
        <div className="logo">🪶</div>
        <ul className="nav-links">
          <li><Link to="/"><button className={currentPath === '/' ? 'active' : ''}>Home</button></Link></li>
          <li><Link to="/journal"><button className={currentPath === '/journal' ? 'active' : ''}>My Journal</button></Link></li> {/* directs to page to write today's entry (for now)*/}
          <li><button>Quotes Feed</button></li>
          <li><button>Insights</button></li>
          <li><button>My Entries</button></li>
          <li><AccountMenu /> </li>
        </ul>
      </nav>
    </div>
      )
}

export default MenuBar;