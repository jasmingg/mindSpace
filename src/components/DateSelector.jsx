import { useState } from "react";
import "../styles/DateSelector.css";


export default function DateSelector() {
  // holds the date to be displayed when first on this page
  const todaysDate = new Date();

  // returns the date for the heading. (eg. Wednesday June 11th.)
  function getFormattedDate(date) {
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


  return (
    <div className="arrow-date-container">
      <img id="leftArrow" src="../src/assets/arrow-fat-line-left-fill.svg" className="arrow-button" />
      
      <h1>{getFormattedDate(viewingDate)}</h1>
      
      <img id ="rightArrow" src="../src/assets/arrow-fat-line-right-fill.svg" className="arrow-button" />
    </div>
  )
}