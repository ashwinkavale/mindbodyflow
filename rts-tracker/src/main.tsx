import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { AuthProvider } from './app/auth'
import { initTheme } from './hooks/useTheme'
import './styles/index.css'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}><AuthProvider><App /></AuthProvider></BrowserRouter></StrictMode>,
)