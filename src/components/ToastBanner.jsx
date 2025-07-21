import { useState, forwardRef, useImperativeHandle  } from "react";
import "../styles/ToastBanner.css"

const ToastBanner = forwardRef((_, ref) => {
    // state object toast: to display banner notification for a brief period
    const [toast, setToast] = useState({
      visible: false,
      message: '',
      type: 'success', // 'success', 'warning', 'error'
    });
  
    // exposes 2 methods to parent MyJournal
    
  useImperativeHandle(ref, () => ({
    // allows MyJournal to call showToast to display a specific toast for 3 seconds
    showToast(message, type, timeMs='3000') {
      setToast({ visible: true, message, type });
                                    // less than 0 allows for negative number as timeMs meaning no restriction
      if (typeof timeMs === "number" && timeMs > 0) {
        setTimeout(() => {
          setToast(prev => ({ ...prev, visible: false }));
        }, timeMs);
      }
    } ,
    // checks if entries are duplicates before saving, returns true/false
    checkToastDuplicate({ currentEntry, savedEntry }) {
        const currentText = (currentEntry.entry || "").trim()
        const currentMood = (currentEntry.mood || "").trim()
        const savedText = (savedEntry?.entry || "").trim();
        const savedMood = (savedEntry?.mood || "").trim();

        if (currentText === savedText && currentMood === savedMood) {
          return true; // duplicate
          }
        return false; // not duplicate
      },
  }
));

const handleCloseToast = () => {
  setToast(prev => ({ ...prev, visible: false })); // only removing visibility (closing banner)
};

  return (
    <>
      {/* if entry is successfully saved, user needs to log in before saving, or entry is a duplicate, this shows up*/}
      {toast.visible && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
           <button className="toast-close" onClick={handleCloseToast}>×</button>
          <div className={toast.type === "success" || toast.type === "warning" ? "toast-timer" : null} />
        </div>
      )}
    </>
  )
});

export default ToastBanner;