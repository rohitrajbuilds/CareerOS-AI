import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/tailwind.css';
import { SidePanelApp } from './app';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found for sidepanel');
}

createRoot(container).render(
  <StrictMode>
    <SidePanelApp />
  </StrictMode>,
);
