import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Prevent duplicate custom element registration errors
if (typeof window !== 'undefined' && window.customElements) {
  const originalDefine = window.customElements.define;
  window.customElements.define = function(name, constructor, options) {
    if (!window.customElements.get(name)) {
      originalDefine.call(this, name, constructor, options);
    }
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
