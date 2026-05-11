import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import posthog from 'posthog-js'

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  capture_pageview: true,
  capture_pageleave: true,
  bootstrap: {
    distinctID: 'user-id-here'
  },
  // Don't track admin routes
  loaded: (ph) => {
    if (window.location.pathname.startsWith('/admin')) {
      ph.opt_out_capturing();
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
