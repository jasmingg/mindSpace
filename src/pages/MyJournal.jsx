import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthState } from '../contexts/AuthContext';
import throttle from "lodash.throttle";
import log from "../utils/logger";
import "../styles/MyJournal.css";

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

  const { isReady, isAuthenticated, username } = useAuthState();

  // compares 2 different dates and returns a boolean (used in child components)
  function isSameDate(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }
  
  // pad: ensures single-digit numbers have a leading zero (e.g., 7 -> "07")
  // toLocalDateString: converts a Date object to a local YYYY-MM-DD string
  //   - uses local time components to avoid timezone issues from toISOString()
  //   - formats month and day with leading zeros for consistent 2-digit output
  const pad = (n) => n.toString().padStart(2, '0');
  const toLocalDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;


    // NOTE: sends GET request to dynamoDB using API gateway + lambda. 
            // limited to one request per 2 seconds.
  const throttledFetchEntry = useCallback(
  throttle(async (date) => {
    // if username does not exist, don't fetch entry, just return nothing
    if (!isAuthenticated || !username) {
      log.warn("Auth not ready or username not set. Skipping fetch.");
      return;
    }
    try {
      setEntryData("");
      const response = await fetch(`${baseAPIRoute}/entries?entryDate=${toLocalDateString(date).split("T")[0]}&userId=${username}`);
      const data = await response.json();
      setEntryData(data);
      log.debug("Fetched entry data:", {
        date: toLocalDateString(date),
        userId: username,
        entry: data
      });
    } 
    catch (err) {
      log.error("Failed to fetch entry:", {
        error: err.message,
        url: `${baseAPIRoute}/entries?date=${date.toISOString().split("T")[0]}&userId=${username}`,
        username,
        date: date.toISOString().split("T")[0]
      });
  setEntryData(null);
}
  }, 2000, { trailing: true }),
  [username, isAuthenticated] // re-creates the throttled function when username changes
);

  // if viewingDate changes: call fetchEntry to create a get request to get entry data for current day
  useEffect(() => {
  if (viewingDate && isAuthenticated && username) {
    throttledFetchEntry(viewingDate);
  }
    // changes on load
}, [viewingDate, throttledFetchEntry]);

  // async function: sends user entry data (POST) to dynamoDB via API gateway + lambda
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Get the latest entry data from EntryDisplay.
    const { entry, mood } = entryDisplayRef.current?.getEntryData();
    const isDuplicate = ToastBannerRef.current.checkToastDuplicate({
      currentEntry: { mood: mood, entry: entry },
      savedEntry: { mood: entryData?.mood, entry: entryData?.entry } 
    })

    if ( isDuplicate && isAuthenticated) {
      ToastBannerRef.current.showToast("No changes to save.", "warning" );
      return;
    }
    else {
      try {
        if (username && isAuthenticated) {
          log.info("Submitting entry...", { mood, entry });
          const response = await fetch(`${baseAPIRoute}/entries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: username,
              entryDate: toLocalDateString(viewingDate), // viewingDate should be today
              mood: mood,
              entry: entry,
            }),
          });
          // check if the response is OK (status code 200-299)
          if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
          }
          // if the response is OK, parse the JSON from the response
          const responseData = await response.json();
          // start getting info about rate limits
          const attemptsLeft = responseData.attemptsLeft;
          const resetTime = new Date(responseData.resetTime); // ISO string -> Date object

          // Format reset time (e.g., "3:38 PM")
          const formattedResetTime = resetTime.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          });
          
          if (attemptsLeft > 0) {
            // setting the usable data to the current entry data
            setEntryData({ mood, entry });
            fetchStats({force: false, isAfterSave: true}); // re-fetch stats, not forced but after saving a NEW entry
            // using exposed method via ref to save entry
            ToastBannerRef.current.showToast(`Entry Saved! ${attemptsLeft} saves allowed until ${formattedResetTime}`, "success");
          } else {
            ToastBannerRef.current.showToast(`No saves left. Try again after ${formattedResetTime}`, "error", -1);
          }
        }
        else {
          ToastBannerRef.current.showToast("Please sign in to save and view your entries", "error", -1); // 0 = indefinite time the toast stays up
        }
      }
      catch (err) {
        ToastBannerRef.current.showToast("Failed to save entry. Please try again.", "error");
        log.error("Failed to save entry:", err);
      }
  }
  }
  // useRef to store the last fetched stats day
  // this is used to avoid unnecessary re-fetching of stats if the day hasn't changed
  const lastFetchedStatsDay = useRef(null);
  const isSameDay = (a, b) =>
    new Date(a).toDateString() === new Date(b).toDateString();

  // async function: retrieves stats (GET) from the API gateway + lambda
  // stats include: total entries and streak data
  // force: if true (on page load), always fetch stats even if already fetched today
  // isAfterSave: if true, fetch stats after saving a new entry for the day
  async function fetchStats(force = false, isAfterSave = false) {
    const todayStr = new Date().toISOString().slice(0, 10); // yyyy-mm-dd format
    // prevent unnecessary fetches 
    // (only fetch if forced (on load) OR if the day has changed OR if after saving a NEW entry for the day):
    // Skip fetching stats if:
        // - we're not forcing a refresh
        // - we already fetched stats today
        // - and we didn't just save a new entry
    if (!force && lastFetchedStatsDay.current && isSameDay(lastFetchedStatsDay.current, todayStr) && !isAfterSave) {
      log.debug("Stats already fetched for today. Skipping fetch.");
      return;
    }
        try {
          const res = await fetch(`${baseAPIRoute}/stats?userId=${username}`);
        // First check if response is HTML
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            const html = await res.text();
            log.error("Received HTML instead of JSON", {
              status: res.status,
              preview: html.substring(0, 100),
              url: `${baseAPIRoute}/stats?userId=${username}`,
            });
            throw new Error(`Server returned HTML instead of JSON. Status: ${res.status}. Response: ${html.substring(0, 100)}...`);
          }
          
          if (!res.ok) {
             log.error("Fetch failed with non-OK status", {
              status: res.status,
              url: `${baseAPIRoute}/stats?userId=${username}`,
            });
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          
          const data = await res.json();
          setStats({
            streak: 0,
            totalEntries: data.count || "undefined",
            streakData: data.dates || [] // streakData is always an array of the entry dates
          });
          lastFetchedStatsDay.current = todayStr;

        } catch (err) {
            log.error("Error occurred while fetching stats", {
              message: err.message,
              stack: err.stack,
              url: `${baseAPIRoute}/stats?userId=${username}`,
            });
        } finally {
          setLoadingStats(false);
        }
      }

  // runs on load or login: if username is set and user is authenticated, fetch stats
  useEffect(() => {
    if (username && isAuthenticated) { 
      log.info("Fetching stats for user:", username);
      fetchStats({ force: true }) // force fetch on page load
      .then( () => log.debug("Stats fetched successfully", { username }) ) // after fetch is resolved, we log the result
      .catch( err => log.error("Stats fetch failed", { error: err.message }) );
    }
  }, [isAuthenticated, username]);

  return (
    <div className="journal-page">
      <MenuBar />
      <div className="journal-entry-section">
        <header className="journal-header">
            <DateSelector
              viewingDate={viewingDate} 
              changeDate={changeDate}
              // changes to true or false every time a successful login or logout happens
              loggedInAccess={isAuthenticated ? true : false}/>
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
                {username && isAuthenticated? 
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