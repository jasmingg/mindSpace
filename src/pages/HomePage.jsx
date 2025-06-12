import React from "react";
import "../styles/HomePage.css";
import { Link } from 'react-router-dom';

import MenuBar from "../components/MenuBar"

export default function HomePage() {
  return (
    <div className="home-page">
      {/* NavBar */}
      <MenuBar />

      {/* Hero Section */}
      <section className="hero">
        <h1>MindSpace</h1>
        <p>Penny for your thoughts?</p>
        <Link to="/journal"><button className="create-entry">Create Today’s Entry</button></Link>
      </section>

      {/* Top Hits Section */}
      <section className="top-hits">
        <h2>Today’s Top Hits</h2>
        <p className="subtitle">Public Entries You Might Like</p>
        <div className="entries">
          {[
            {
              title: "Train Ride Thoughts",
              user: "@chris.j",
              preview: "I watched trees...",
            },
            {
              title: "A Decent Day. Actually",
              user: "@jayWrites",
              preview: "Got coffee and...",
            },
            {
              title: "Small Talk Sucks",
              user: "@an0nRant",
              preview: "A waste of time...",
            },
          ].map(({ title, user, preview }, idx) => (
            <div key={idx} className="entry-card">
              <h3>“{title}”</h3>
              <div className="user">👤 <span>{user}</span></div>
              <p>
                {preview} <span className="read-more">[read more]</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}