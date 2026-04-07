import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import ReportPage from './pages/ReportPage.jsx';

export default function App() {
  const [userData, setUserData] = useState(null);

  const handleStartInterview = (data) => {
    setUserData(data);
  };

  return (
    <Router>
      <div className="bg-slate-950 min-h-screen">
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage onStart={handleStartInterview} />} 
          />
          <Route 
            path="/interview" 
            element={
              userData ? (
                <InterviewRoom userData={userData} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/report" 
            element={<ReportPage />} 
          />
        </Routes>
      </div>
    </Router>
  );
}
