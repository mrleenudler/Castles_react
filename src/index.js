import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import PlayCastles from './play_castles'; 
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PlayCastles /> {/* Denne må reflekteres i play_castles.jsx */}
  </React.StrictMode>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// Optional: reportWebVitals is for performance measurement
reportWebVitals();
