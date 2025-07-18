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
    showToast(message, type) {
      setToast({ visible: true, message, type });
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
    } ,
    // checks if entries are duplicates before saving, returns true/false
    checkAndToastDuplicate({ currentEntry, savedEntry }) {
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

  return (
    <>
      {/* if entry is successfully saved, user needs to log in before saving, or entry is a duplicate, this shows up*/}
      {toast.visible && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
          <div className="toast-timer" />
        </div>
      )}
    </>
  )
});

export default ToastBanner;