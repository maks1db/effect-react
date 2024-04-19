import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startDevtoolsInspector } from '../../../src/index.ts'

if (process.env.NODE_ENV === 'development') {
  startDevtoolsInspector('Query Entities example')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
