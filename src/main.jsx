import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.onerror = (msg, url, line) => {
  console.log("GLOBAL ERROR:", msg, "at", url, ":", line)
}

window.onunhandledrejection = (event) => {
  console.log("UNHANDLED PROMISE REJECTION:", event.reason)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
