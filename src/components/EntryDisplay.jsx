import { useState, useEffect} from 'react';

const EntryDisplay = ( {entryData, isSameDate, viewingDate} ) => {
      //the max character length for an entry
  const maxChars = 10000;

  const isToday = isSameDate(new Date(), viewingDate)

  // holds the changing entry value depending on the day
  const [entry, setEntry] = useState(entryData?.entry || "");

  // ensures the entry is connected to the changing date
  useEffect(() => {
            // the ? makes sure entry exists, otherwise returns false instead of an error
    setEntry(entryData?.entry || "");
  }, [entryData]);



  // function provides mood options available based on previous submissions if any
  function moodDisplay () {
    if (entryData.mood === "happy" ) {
      return (
        <option id="happy">😊 Happy</option>
      )
    }
    else if (entryData.mood === "okay") {
      return (
        <option id="okay">😐 Okay</option>
      )
    }
    else if (entryData.mood === "sad") {
      return (
        <option id="sad">😞 Sad</option>
      )
    }

    else if (entryData.mood === "frustrated") {
      return (
        <option id="frustrated">😤 Frustrated</option>
      )
    }

    else if (entryData.mood === "calm") {
      return (
        <option id="calm">😌 Calm</option>
      )
    }

  else {
    return (
      <option id="none"> no data available</option>
    )
  }
  }

  return (
// css might be messed up bc this section was before the form, but now its after form
<section className="entry-form">
          <h2>Today I feel...</h2>
            <label htmlFor="mood">Mood</label>
            {/* if user is viewing current day's entry, give options. otherwise show last submission*/}
            {isToday ? (
              <select id="mood" name="mood">
                <option id="happy">😊 Happy</option>
                <option id="okay">😐 Okay</option>
                <option id="sad">😞 Sad</option>
                <option id="frustrated">😤 Frustrated</option>
                <option id="calm">😌 Calm</option>
              </select>) :
              (moodDisplay())
            }
            
            <label htmlFor="entry">Your thoughts</label>
            <textarea 
              id="entry"
              /* shows current entry, editable if isToday is true else readOnly */
              value={ entry }
              readOnly={!isToday}
              rows="6" 
              placeholder="Write freely..."
              onChange={(e) => setEntry(e.target.value)}
              maxLength = {maxChars}/>
          <p className="caveatFont" style={{ textAlign: 'right', color: '#888' }}>
            {entry.length}/{maxChars}
          </p>
          { isToday ?
            <button type="submit">Save Entry</button>
            : null}
        </section>
  )
}

export default EntryDisplay;