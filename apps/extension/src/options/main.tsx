import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OptionsApp } from './app';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found for options');
}

createRoot(container).render(
  <StrictMode>
    <OptionsApp />
  </StrictMode>,
);
