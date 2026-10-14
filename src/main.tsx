import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyAppearance } from './hooks/useTheme'
import './index.css'

applyAppearance(
  (() => {
    try {
      const saved = localStorage.getItem('securepass-appearance')
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    } catch {
      /* Sin almacenamiento disponible se respeta el sistema. */
    }
    return 'system'
  })(),
)

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el contenedor de la aplicación.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
