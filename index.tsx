import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import App from './App';
import { initSentry } from './lib/sentry';

// Initialize Sentry as early as possible
initSentry();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
// Note: StrictMode temporarily disabled to debug portal removeChild error
// TODO: Re-enable after fixing the manifest dialog issue
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
