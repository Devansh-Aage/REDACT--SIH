import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from './component/SignIn';
import SignUp from './component/SignUp';
import LandingPage from './component/LandingPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
  );
}

export default App;
