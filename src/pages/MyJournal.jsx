import { useState, useEffect, useCallback, useRef } from "react";
import throttle from "lodash.throttle";
import "../styles/MyJournal.css";

// holds content for navigation: Home, Entries, etc
import MenuBar from "../components/MenuBar"

// content for changing the current entry date (arrows, current date header,...)
import DateSelector from "../components/DateSelector"

// content for displaying entries (based on entry date)
import EntryDisplay from "../components/EntryDisplay"

// content for messages when attempting to save entry (success, error - not logged in, warning - duplicate)
import ToastBanner from "../components/ToastBanner"
const MyJournal = () => {

    // holds the value for the date title to display on page
  const [viewingDate, changeDate] = useState(new Date()); // today's date = new Date()
    // holds the entry content to display on page
  const [entryData, setEntryData] = useState(null);

    // a ref prop when calling EntryData: gives access to exposed method entryData
  const entryDisplayRef = useRef();

   // a ref prop when calling ToastBanner: gives access to exposed method showToast
  const ToastBannerRef = useRef();

  // compares 2 different dates and returns a boolean (used in child components)
  function isSameDate(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  // clicking save entry sends user to this API gateway link
  const saveEntryRoute = import.meta.env.VITE_JOURNAL_SAVE_ENTRY_API_ROUTE;

    // NOTE: sends GET request to dynamoDB using API gateway to lambda. Limited to one request per 2 seconds.
  const throttledFetchEntry = useCallback(
  throttle(async (date) => {
    try {
      setEntryData("");
      // TO DO: fix the link, currently the query parameter after /entries requests specifically for user123's entry for a specific day
      const response = await fetch(`https://1cmhezd4r6.execute-api.us-east-1.amazonaws.com/dev/entries?entryDate=${date.toISOString().split("T")[0]}&userId=jasmingg`);
      const data = await response.json();
      setEntryData(data);
    } catch (err) {
      console.error("Failed to fetch entry:", err);
      setEntryData(null); // fallback to blank if nothing returned
    }
  }, 2000, { trailing: true }),
  [] // <- stable instance
);

  // if viewingDate changes: call fetchEntry to create a GET request to get entry data for current day
  useEffect(() => {
  if (viewingDate) {
    throttledFetchEntry(viewingDate);
  }
}, [viewingDate, throttledFetchEntry]);




  // async function: sends user entry data to dynamoDB via API gateway + lambda
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Get the latest entry data from EntryDisplay.
    const { entry, mood } = entryDisplayRef.current.getEntryData();
    const isDuplicate = ToastBannerRef.current.checkAndToastDuplicate({
    currentEntry: { mood: mood, entry: entry },
    savedEntry: { mood: entryData?.mood, entry: entryData?.entry } })

    if ( isDuplicate ) {
      console.log("isDuplicate is true")
      ToastBannerRef.current.showToast("No changes to save.", "warning" );
      return;
    }
    else {
      console.log("running submit")
      try {
        console.log("Submitting entry:", { mood, entry });
        const response = await fetch(saveEntryRoute, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "jasmingg",                    // replace with actual user ID later
            entryDate: new Date().toISOString().split("T")[0],
            mood: mood,
            entry: entry,
          }),
        });
        const data = await response.json();
        console.log("Entry Saved:" , data.message);
        // using exposed method via ref to save entry
        ToastBannerRef.current.showToast("Entry Saved!", "success");
      }
      catch (err) {
        console.error("Failed to submit entry");
      }
  }
  }

  // using a state variable for this number, however for now we will keep it statically equal to 0
  const [streakCount, setStreak] = useState(0);

  return (
    <div className="journal-page">
      <MenuBar />
      <div className="journal-entry-section">
        <header className="journal-header">
            <DateSelector
              viewingDate={viewingDate} 
              changeDate={changeDate}/>
            <p>Reflect on your day, track your thoughts.</p>
        </header>
          <form onSubmit={handleSubmit}>

            <section className="stats">
              <div className="stat-box">
                <h2>0</h2>
                <p>Total Entries</p>
              </div>

              <div className="stat-box streak-card">
                <div
                  className="streak-icon"
                  title="Displays users streaks based on continuous daily entries">
                    🔥
                </div>
                <p>{streakCount} day streak!</p>
              </div>
            </section>
            <EntryDisplay 
              ref={entryDisplayRef}
              entryData={entryData}
              isSameDate={isSameDate}
              viewingDate={viewingDate} />
          </form>
      </div>
      <ToastBanner
        ref={ToastBannerRef} />
    </div>
  );
}

export default MyJournal;