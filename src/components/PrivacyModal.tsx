import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

const POINTS = [
  'La generación se ejecuta en el navegador, con el generador aleatorio del propio dispositivo.',
  'La evaluación se ejecuta en el navegador. El texto no sale de esta página.',
  'No existe historial de contraseñas. Al cerrar o recargar la página, el contenido desaparece.',
  'El botón de copiar utiliza el portapapeles del dispositivo. SecurePass no recibe una copia.',
  'Evita introducir contraseñas en dispositivos públicos o comprometidos.',
  'La única preferencia que puede guardarse es la apariencia: claro, oscuro o sistema. Nunca una contraseña.',
]

export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    function focusable(): HTMLElement[] {
      return [...(dialog?.querySelectorAll<HTMLElement>(selector) ?? [])]
    }

    focusable()[0]?.focus()
    document.body.classList.add('overflow-hidden')

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('overflow-hidden')
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-900/60" aria-label="Cerrar explicación" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">
            Cómo protege SecurePass tu contraseña
          </h2>
          <button type="button" className="btn-ghost px-2 py-2" onClick={onClose} aria-label="Cerrar">
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div id={descriptionId} className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {POINTS.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" className="btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
