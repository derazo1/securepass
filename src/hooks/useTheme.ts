import { useEffect, useState } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'

export const APPEARANCE_STORAGE_KEY = 'securepass-appearance'

function readChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(APPEARANCE_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {
    /* El navegador puede bloquear el almacenamiento; se usa la preferencia del sistema. */
  }
  return 'system'
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyAppearance(choice: ThemeChoice, prefersDark = systemPrefersDark()): void {
  const dark = choice === 'dark' || (choice === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme(): {
  choice: ThemeChoice
  setChoice: (choice: ThemeChoice) => void
  resolved: 'light' | 'dark'
} {
  const [choice, setChoice] = useState<ThemeChoice>(() => readChoice())
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark)
  const resolved = choice === 'system' ? (prefersDark ? 'dark' : 'light') : choice

  useEffect(() => {
    applyAppearance(choice, prefersDark)
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, choice)
    } catch {
      /* Solo se intenta guardar la apariencia, nunca una contraseña. */
    }
  }, [choice, prefersDark])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setPrefersDark(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return { choice, setChoice, resolved }
}
