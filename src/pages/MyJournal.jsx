import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "react-oidc-context";
import throttle from "lodash.throttle";
import "../styles/MyJournal.css";

// self-made hook for gaining access to tokens
import useTokens from "../components/hooks/useTokens"

// holds content for navigation:Home, Entries, etc
import MenuBar from "../components/MenuBar"

// content for changing the current entry date (arrows, current date header,...)
import DateSelector from "../components/DateSelector"

// content for displaying entries (based on entry date)
import EntryDisplay from "../components/EntryDisplay"

// content for messages when attempting to save entry (success, error - not logged in, warning - duplicate)
import ToastBanner from "../components/ToastBanner"

// content for stats on the max days in a row a user has continuously logged entries for
import StreakCounter from "../components/StreakCounter";

const MyJournal = () => {
    // insert base URL from AWS API Gateway Invoke URL
  const baseAPIRoute = import.meta.env.VITE_JOURNAL_BASE_ROUTE;

    // holds the value for the date title to display on page
  const [viewingDate, changeDate] = useState(new Date()); // today's date = new Date()
    // holds the entry content to display on page
  const [entryData, setEntryData] = useState(null);
    // holds 2 stats: streak and total entry counters
  const [stats, setStats] = useState({ totalEntries: "n/a", streakData: [] });
    // tool to know when the stats are returned from fetch API call
  const [loadingStats, setLoadingStats] = useState(true);

    // used in <EntryData />: gives access to exposed function entryData
  const entryDisplayRef = useRef();

   // used in <ToastBanner />: gives access to exposed function showToast
  const ToastBannerRef = useRef();

  // getting tokens from hook. Can hold null or the tokens
  const {accessToken, idToken} = useTokens();

  const auth = useAuth();
  // can be null or hold the username, auth is stateful
  const username = auth.user?.profile?.["cognito:username"];

  // compares 2 different dates and returns a boolean (used in child components)
  function isSameDate(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

    // NOTE: sends GET request to dynamoDB using API gateway to lambda. Limited to one request per 2 seconds.
  const throttledFetchEntry = useCallback(
  throttle(async (date) => {
    try {
      // if username does not exist, don't fetch entry, just return nothing
      if (!username && auth.isAuthenticated) { return;}
      setEntryData("");
      const response = await fetch(`${baseAPIRoute}/entries?entryDate=${date.toISOString().split("T")[0]}&userId=${username}`);
      const data = await response.json();
      setEntryData(data);
    } 
    catch (err) {
      console.error("Failed to fetch entry:", {
      error: err,
      url: `${baseAPIRoute}/entries?date=${date.toISOString().split("T")[0]}&userId=${username}`,
      status: response?.status,
      statusText: response?.statusText
    });
  setEntryData(null);
}
  }, 2000, { trailing: true }),
  [username] // re-creates the throttled function when username changes
);

  // if viewingDate changes: call fetchEntry to create a get request to get entry data for current day
  useEffect(() => {
  if (viewingDate && auth.isAuthenticated && username) {
    throttledFetchEntry(viewingDate);
  }
    // changes on load
}, [viewingDate, throttledFetchEntry]);

  // async function: sends user entry data (POST) to dynamoDB via API gateway + lambda
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Get the latest entry data from EntryDisplay.
    const { entry, mood } = entryDisplayRef.current?.getEntryData();
    console.log("Submitting entry:", { mood, entry });
    const isDuplicate = ToastBannerRef.current.checkToastDuplicate({
    currentEntry: { mood: mood, entry: entry },
    savedEntry: { mood: entryData?.mood, entry: entryData?.entry } })

    if ( isDuplicate && username !== undefined) {
      ToastBannerRef.current.showToast("No changes to save.", "warning" );
      return;
    }
    else {
      try {
        if (username) {
        console.log("Submitting entry:", { mood, entry });
        const response = await fetch(`${baseAPIRoute}/entries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: username,
            entryDate: viewingDate.toISOString().split('T')[0], // viewingDate should be today
            mood: mood,
            entry: entry,
          }),
        });
        // using exposed method via ref to save entry
        ToastBannerRef.current.showToast("Entry Saved!", "success");
      }
      else {
        ToastBannerRef.current.showToast("Please sign in to save and view your entries", "error", -1); // 0 = indefinite time the toast stays up
      }
      }
      catch (err) {
        ToastBannerRef.current.showToast("Failed to save entry. Please try again.", "error");
      }
  }
  }

  // async function: retrieves stats (GET) from the API gateway + lambda
    // stats include: total entries and streak data
      async function fetchStats() {
        try {
          const res = await fetch(`${baseAPIRoute}/stats?userId=${username}`);
        // First check if response is HTML
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            const html = await res.text();
            throw new Error(`Server returned HTML instead of JSON. Status: ${res.status}. Response: ${html.substring(0, 100)}...`);
          }
          
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          
          const data = await res.json();
          setStats({
            streak: 0,
            totalEntries: data.count || "undefined",
            streakData: data.dates || [] // streakData is always an array of the entry dates
          });

        } catch (err) {
          console.error("Detailed stats fetch error:", {
            error: err.message,
            url: `${baseAPIRoute}?userId=${username}`,
            stack: err.stack
          });
        } finally {
          setLoadingStats(false);
        }
      }

  // if username changes and is not null, fetch stats
  useEffect(() => {
    if (username && auth.isAuthenticated) { 
      console.log("Username changed:", username);
      fetchStats();
      console.log("fetched stats");
    }
  }, [username]);


  return (
    <div className="journal-page">
      <MenuBar />
      <div className="journal-entry-section">
        <header className="journal-header">
            <DateSelector
              viewingDate={viewingDate} 
              changeDate={changeDate}
              // changes to true or false every time a successful login or logout happens
              loggedInAccess={auth.isAuthenticated ? true : false}/>
            <p>Reflect on your day, track your thoughts.</p>
        </header>
          <form onSubmit={handleSubmit}>

            <section className="stats">
              <div className="stat-box">
                {/* displays the current number of entries for logged in user*/}
                <h2>{loadingStats ? "N/A" : stats.totalEntries}</h2>
                <p>Total Entries</p>
              </div>

              <div className="stat-box streak-card">
                <div
                  className="streak-icon"
                  title="Displays users streaks based on continuous daily entries">
                    🔥
                </div>
                {username && auth.isAuthenticated? 
                  loadingStats ? 
                    <p>Loading...</p>
                      : <StreakCounter
                          streakData={stats.streakData}
                        />
                  : <p>Log in to track</p> 
                }
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