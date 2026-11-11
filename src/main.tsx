import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Start one shared interface while storage selects its platform at runtime.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
