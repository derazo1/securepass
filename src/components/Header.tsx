import { Lock, Monitor, Moon, Shield, Sun } from 'lucide-react'
import { useTheme, type ThemeChoice } from '../hooks/useTheme'

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

export function Header() {
  const { choice, setChoice } = useTheme()

  return (
    <header className="mb-5 flex flex-col gap-3 sm:mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white dark:bg-blue-600">
            <Shield aria-hidden="true" size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">SecurePass</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Genera y evalúa contraseñas de forma privada
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-col sm:items-end">
          <div role="radiogroup" aria-label="Apariencia" className="flex flex-wrap rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900">
            {OPTIONS.map((option) => {
              const Icon = option.icon
              const selected = choice === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium ${
                    selected
                      ? 'bg-blue-700 text-white dark:bg-blue-500'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setChoice(option.value)}
                >
                  <Icon aria-hidden="true" size={15} />
                  {option.label}
                </button>
              )
            })}
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <Lock aria-hidden="true" size={13} />
            Procesamiento local
          </p>
        </div>
      </div>
    </header>
  )
}
