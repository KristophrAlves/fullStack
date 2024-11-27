import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RequestRidePage from './pages/RequestRidePage';
import OptionsPage from './pages/OptionsPage';
import HistoryPage from './pages/HistoryPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequestRidePage />} />
        <Route path="/options" element={<OptionsPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
