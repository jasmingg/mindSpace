import React, { useState, useRef } from "react";
import "../styles/MyJournal.css";

import MenuBar from "../components/MenuBar"

const MyJournal = () => {
  const [entry, setEntry] = useState('');
  const maxChars = 10000;

  // returns the date for the heading. (eg. Wednesday June 11th.)
  function getFormattedDate() {
    const date = new Date();
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();
  
    // Adding a suffix depending on the day (1st, 2nd, 3rd, 4th...)
    const suffix = (n) => {
      if (n > 3 && n < 21) return `${n}th`;
      switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
      }
    };
  
    return `${weekday}, ${month} ${suffix(day)}.`;
  }


  const [colorOfDay, setColorOfDay] = useState("#e0bbff");
  // reduces lag
  let animationFrame = useRef(null);
  // reduces lag from react handling color change animation from picker
  const handleColorChange = (e) => {
    const newColor = e.target.value;

    if (animationFrame){ cancelAnimationFrame(animationFrame)};
    animationFrame.current = requestAnimationFrame(() => {
      setColorOfDay(newColor);
    });
  };

  return (
    <div className="journal-page">
      <MenuBar />
      <div className="journal-entry-section">
        <header className="journal-header">
          <h1> {getFormattedDate()}</h1>
          <p>Reflect on your day, track your thoughts.</p>
        </header>

        <section className="stats">
  <div className="stat-box">
    <h2>0</h2>
    <p>Total Entries</p>
  </div>

  <div className="stat-box color-card">
    <div
      className="color-icon"
      title="Pick your color of the day"
    >
      🎨
    </div>
    <p>Color of the Day</p>

    {
      <input
        type="color"
        defaultValue={colorOfDay}
        onInput={handleColorChange}
        className="color-input"
      />
    }
  </div>
</section>

        <section className="entry-form">
          <h2>Today I feel...</h2>
          <form>
            <label htmlFor="mood">Mood</label>
            <select id="mood" name="mood">
              <option>😊 Happy</option>
              <option>😐 Okay</option>
              <option>😞 Sad</option>
              <option>😤 Frustrated</option>
              <option>😌 Calm</option>
            </select>

            <label htmlFor="entry">Your thoughts</label>
            <textarea 
              id="entry"
              value={entry}
              rows="6" 
              placeholder="Write freely..."
              onChange={(e) => setEntry(e.target.value)}
              maxLength = {maxChars}/>
          <p className="caveatFont" style={{ textAlign: 'right', color: '#888' }}>
            {entry.length}/{maxChars}
          </p>

            <button type="submit">Save Entry</button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default MyJournal;