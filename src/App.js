import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TrackingApp from './components/TrackingApp';
import PostOpPage from './components/PostOpPage';
import './index.css';

const basename = process.env.PUBLIC_URL || '/';

function App() {
  return (
    <div className="App">
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<TrackingApp />} />
          <Route path="postop" element={<PostOpPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;