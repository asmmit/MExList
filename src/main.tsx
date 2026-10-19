import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className="film-grain-overlay" aria-hidden="true" />
    <App />
  </React.StrictMode>
);
