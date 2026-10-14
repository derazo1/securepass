import { useState, type KeyboardEvent } from 'react'
import { EvaluatorTab } from './components/EvaluatorTab'
import { GeneratorTab } from './components/GeneratorTab'
import { Header } from './components/Header'
import { PrivacyBanner } from './components/PrivacyBanner'
import { PrivacyModal } from './components/PrivacyModal'

type TabId = 'generate' | 'evaluate'

const TABS: { id: TabId; label: string; panel: string }[] = [
  { id: 'generate', label: 'Generar contraseña', panel: 'panel-generar' },
  { id: 'evaluate', label: 'Evaluar contraseña', panel: 'panel-evaluar' },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('generate')
  const [privacyOpen, setPrivacyOpen] = useState(false)

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = TABS.findIndex((item) => item.id === tab)
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    let next = current
    if (event.key === 'ArrowRight') next = (current + 1) % TABS.length
    if (event.key === 'ArrowLeft') next = (current - 1 + TABS.length) % TABS.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = TABS.length - 1
    const selected = TABS[next]
    if (!selected) return
    setTab(selected.id)
    document.getElementById(`tab-${selected.id}`)?.focus()
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <a
        href="#contenido"
        className="sr-only rounded-lg bg-blue-700 px-3 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <div role="tablist" aria-label="Herramientas" className="mb-4 grid grid-cols-2 gap-2" onKeyDown={onTabKeyDown}>
          {TABS.map((item) => {
            const selected = tab === item.id
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={item.panel}
                tabIndex={selected ? 0 : -1}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  selected
                    ? 'bg-blue-700 text-white dark:bg-blue-600'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'
                }`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div id="panel-generar" role="tabpanel" aria-labelledby="tab-generate" hidden={tab !== 'generate'}>
          <GeneratorTab />
        </div>
        <div id="panel-evaluar" role="tabpanel" aria-labelledby="tab-evaluate" hidden={tab !== 'evaluate'}>
          <EvaluatorTab />
        </div>
      </main>
      <PrivacyBanner onOpen={() => setPrivacyOpen(true)} />
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  )
}
