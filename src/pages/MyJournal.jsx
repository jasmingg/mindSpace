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
  
    // adding a suffix depending on the day (1st, 2nd, 3rd, 4th...)
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
  
  const saveEntryRoute = import.meta.env.VITE_JOURNAL_SAVE_ENTRY_API_ROUTE;

  // async function sends user entry data to dynamoDB via API gateway + lambda
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(saveEntryRoute, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "testUser123",                    // replace with actual user ID later
        entryDate: new Date().toISOString().split("T")[0],
        mood: document.getElementById("mood").value,
        entry: entry,
      }),
    });
    const data = await response.json();
    console.log(data.message);
  }


  // Creating a state variable for this number, however for now we will keep it statically equal to 0
  const [streakCount, setStreak] = useState(0);

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

  <div className="stat-box streak-card">
    <div
      className="streak-icon"
      title="Displays users streaks based on continuous daily entries"
    >
      🔥
    </div>
    <p>{streakCount} day streak!</p>
  </div>
</section>

        <section className="entry-form">
          <h2>Today I feel...</h2>
          <form onSubmit={handleSubmit}>
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