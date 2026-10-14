import { ShieldCheck } from 'lucide-react'

export function PrivacyBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <aside className="card mt-4 flex flex-col gap-3 !py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <ShieldCheck aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Tu contraseña permanece en este dispositivo
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            SecurePass no almacena ni envía las contraseñas que generas o evalúas.
          </p>
        </div>
      </div>
      <button type="button" className="btn-secondary shrink-0" onClick={onOpen}>
        Ver cómo funciona
      </button>
    </aside>
  )
}
