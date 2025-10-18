import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('Content is cached for offline use.');
  },
  onUpdate: (registration) => {
    console.log('New content is available and will be used when all tabs for this page are closed.');
    // You can add logic here to notify users about updates
  }
});

// Setup install prompt
serviceWorkerRegistration.setupInstallPrompt();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
