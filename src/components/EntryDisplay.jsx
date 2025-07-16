import { useState, useEffect} from 'react';

const EntryDisplay = ( {entryData, isSameDate, viewingDate} ) => {
      //the max character length for an entry
  const maxChars = 10000;

  const isToday = isSameDate(new Date(), viewingDate)

  // holds the changing entry value depending on the day
  const [entry, setEntry] = useState(entryData?.entry || "starting");

  // holds the value for a saved mood for a date, if it exists, or just ""
  const [selectedMood, setSelectedMood] = useState(entryData?.mood || "");

   const [loading, setLoading] = useState(true); // holds value for if screen is loading


  // ensures the entryData (prop) is connected to the changing date
  useEffect(() => {
            // the ? makes sure entry exists, otherwise returns false instead of an error
    setEntry(entryData?.entry || "");
     console.log("entryData.mood is:", entryData?.mood);
     if (entryData?.mood && entryData.mood !==  selectedMood) {
      setSelectedMood(entryData.mood);
     }
     setTimeout(() => setLoading(false), 200); // smooth fade to 200 milliseconds
  }, [entryData]);



  // function provides mood options available based on previous submissions if any
  function renderMoodDropdown () {
    // CASE 1 & 2: if viewingDate is today (Either mood has been previously saved or not...)
        if (isToday) {
          return (
            <select
              id="mood"
              name="mood"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
            >
              <option value="">-- Select your mood --</option>
              <option value="happy" id="happy">😊 Happy</option>
              <option valu="okay"id="okay">😐 Okay</option>
              <option value="sad" id="sad">😞 Sad</option>
              <option value="frustrated" id="frustrated">😤 Frustrated</option>
              <option value="calm" id="calm">😌 Calm</option>
            </select>)
        }
    
    // CASE 3: if viewingDate is not today but the entry's mood has been saved
    if (!isToday && entryData.mood) {
      if (entryData.mood === "happy") {
      return (
        <select id="mood" name="mood" value="happy" disabled>
          <option value="happy" id="happy">😊 Happy</option>
          <option value=""></option>
        </select>
      );
    } else if (entryData.mood === "okay") {
      return (
        <select id="mood" name="mood" value="okay" disabled>
          <option value="okay" id="okay">😐 Okay</option>
          <option value=""></option>
        </select>
      );
    } else if (entryData.mood === "sad") {
      return (
        <select id="mood" name="mood" value="sad" disabled>
          <option value="sad" id="sad">😞 Sad</option>
          <option value=""></option>
        </select>
      );
    } else if (entryData.mood === "frustrated") {
      return (
        <select id="mood" name="mood" value="frustrated" disabled>
          <option value="frustrated" id="frustrated">😤 Frustrated</option>
          <option value=""></option>
        </select>
      );
    } else if (entryData.mood === "calm") {
      return (
        <select id="mood" name="mood" value="calm" disabled>
          <option value="calm" id="calm">😌 Calm</option>
          <option value=""></option>
        </select>
      );
    }
  }
    

    // CASE 4: not today AND no saved mood
  return <div style={{ color: '#888' }}>No mood data available.</div>;
  

  }
return (
    <section
      style={{
        position: 'relative',
        minHeight: '300px',
      }}
    >
      {/* loading overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#fff8f0',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            fontFamily: 'Caveat, cursive',
            color: '#888',
            fontSize: '1.5rem',
            transition: 'opacity 0.3s ease',
          }}
        >
          Loading entry...
        </div>
      )}

      {/* actual form content, placed behind loading overlay for smooth transition */}
      <section
        className="entry-form"
        style={{
          opacity: loading ? 0 : 1,
          pointerEvents: loading ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
        }}
      >
        <h2>Today I feel...</h2>
        <label htmlFor="mood">Mood</label>
        {renderMoodDropdown()}
        <label htmlFor="entry">Your thoughts</label>
        <textarea
          id="entry"
          value={entry}
          readOnly={!isToday}
          rows="6"
          placeholder={entryData?.entry ? "Write freely..." : "Nothing to see here"}
          onChange={(e) => setEntry(e.target.value)}
          maxLength={maxChars}
        />
        <p className="caveatFont" style={{ textAlign: 'right', color: '#888' }}>
          {entry.length}/{maxChars}
        </p>
        {isToday && <button type="submit">Save Entry</button>}
      </section>
    </section>
  );
};

export default EntryDisplay;