import React, { useState, useEffect } from "react";
import "../styles/MyJournal.css";

// holds content for navigation: Home, Entries, etc
import MenuBar from "../components/MenuBar"

// content for changing the current entry date (arrows, current date header,...)
import DateSelector from "../components/DateSelector"

// content for displaying entries (based on entry date)
import EntryDisplay from "../components/EntryDisplay"

const MyJournal = () => {

    // holds the value for the date title to display on page
  const [viewingDate, changeDate] = useState(new Date()); // today's date = new Date()
    // holds the entry content to display on page
  const [entryData, setEntryData] = useState(null);

  // compares 2 different dates and returns a boolean (used in child components)
  function isSameDate(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

  // clicking save entry sends user to this API gateway link
  const saveEntryRoute = import.meta.env.VITE_JOURNAL_SAVE_ENTRY_API_ROUTE;

  // if viewingDate changes: call fetchEntry to create a GET request to get entry data for current day
  useEffect(() => {
  if (viewingDate) {
    fetchEntry(viewingDate);
  }
}, [viewingDate]);

  // async function: sends user entry data to dynamoDB via API gateway + lambda
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

  // async function: get current viewing day's entry data from dynamoDB using API gateway
  const fetchEntry = async (date) => {
  try {
    // TO DO: fix the link, currently the query parameter after /entries requests specifically for user123's entry for a specific day
    const response = await fetch(`https://1cmhezd4r6.execute-api.us-east-1.amazonaws.com/dev/entries?entryDate=${date.toISOString().split("T")[0]}&userId=jasmingg`);
    const data = await response.json();
    setEntryData(data);
  } catch (err) {
    console.error("Failed to fetch entry:", err);
    setEntryData(null); // fallback to blank if nothing returned
  }
};



  // Creating a state variable for this number, however for now we will keep it statically equal to 0
  const [streakCount, setStreak] = useState(0);

  return (
    <div className="journal-page">
      <MenuBar />
      <div className="journal-entry-section">
      <header className="journal-header">
        <form onSubmit={handleSubmit}>
          <DateSelector
            viewingDate={viewingDate} 
            changeDate={changeDate} 
            fetchEntry={fetchEntry} />
        </form>
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
    <EntryDisplay 
      entryData={entryData}
      isSameDate={isSameDate}
      viewingDate={viewingDate} />
      </div>
    </div>
  );
}

export default MyJournal;