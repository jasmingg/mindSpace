import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MyJournal from './pages/MyJournal';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/journal" element={<MyJournal />} />
      </Routes>
    </Router>
  );
};

export default App;