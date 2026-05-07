import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PopupApp } from './app';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found for popup');
}

createRoot(container).render(
  <StrictMode>
    <PopupApp />
  </StrictMode>,
);
