import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './component/SignIn';
import SignUp from './component/SignUp';
import LandingPage from './component/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
