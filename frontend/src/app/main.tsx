import 'react-toastify/dist/ReactToastify.css';
import './styles/index.css';

import { StrictMode } from 'react';
import { ToastContainer } from 'react-toastify';
import { createRoot } from 'react-dom/client';

import { AppProviders } from './providers/AppProviders';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </AppProviders>
  </StrictMode>,
);
