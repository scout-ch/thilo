import React from 'react';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

// Progressive Web App service worker instantiation
if ('serviceWorker' in navigator) {
  const homepage = process.env.PUBLIC_URL || process.env.HOMEPAGE || '/';
  const serviceWorkerPath = `${homepage}service-worker.js`;

  navigator.serviceWorker
    .register(serviceWorkerPath, { scope: homepage })
    .then((registration) => {
      console.log('ServiceWorker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('ServiceWorker registration failed:', error);
    });
}


root.render(
<React.StrictMode>
  <App />
</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
