
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SharedResult from './components/SharedResult';
import Background from './components/Background';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Background />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shared/:id" element={<SharedResult />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
