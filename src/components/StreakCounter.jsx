const StreakCounter = ({ streakData }) => {

function getMaxStreak(streakData) {
  // if no data or not an array, return 0
  if (!Array.isArray(streakData) || streakData.length === 0) return 0;

  // convert each entry into a Date object (just the yyyy-mm-dd part)
  // then sort the dates from oldest to newest
  const dates = streakData
    .map(date => new Date(date.split("T")[0])) // remove time if it's included
    .sort((a, b) => a - b);

  // maxStreak keeps track of the longest streak found
  // currentStreak counts the current chain of consecutive days
  let maxStreak = 1;
  let currentStreak = 1;

  // loop through each pair of dates
  for (let i = 1; i < dates.length; i++) {
    const prevDate = dates[i - 1];
    const currDate = dates[i];

    // find the number of days between current and previous
    const diffInMs = currDate - prevDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // ms to days: 1000ms/s * 60s/min * 60min/hr * 24hr/day

    if (diffInDays === 1) {
      // if the current day is exactly one day after the previous, it's a streak
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffInDays > 1) {
      // if more than one day has passed, reset the current streak
      currentStreak = 1;
    }
    // if same day (diffInDays === 0), just ignore it
  }

  return maxStreak;
}


  return (
    <div className="streak-box">
      <p>{getMaxStreak(streakData)} day streak</p>
    </div>
  );
};

export default StreakCounter;