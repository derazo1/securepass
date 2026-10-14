import { AlertTriangle, Check, Eraser, Eye, EyeOff, Minus, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { CHECK_LABELS, evaluatePassword, type CheckId, type Evaluation } from '../services/passwordEvaluator'
import { StrengthMeter } from './StrengthMeter'
import { Button } from './ui'

const CHECK_ORDER = Object.keys(CHECK_LABELS) as CheckId[]

export function EvaluatorTab() {
  const [value, setValue] = useState('')
  const [visible, setVisible] = useState(false)
  const [result, setResult] = useState<Evaluation | null>(null)
  const [error, setError] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const current = value
    if (!current.trim()) {
      setResult(null)
      setError('Escribe una contraseña para evaluarla.')
      return
    }
    if (current.length > 128) {
      setError('Usa como máximo 128 caracteres.')
      setResult(null)
      return
    }
    setError('')
    setResult(evaluatePassword(current))
  }

  function clear() {
    setValue('')
    setVisible(false)
    setResult(null)
    setError('')
  }

  return (
    <section
      className="card grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8"
      aria-labelledby="evaluar-titulo"
    >
      <div className="min-w-0">
        <h2 id="evaluar-titulo" className="text-lg font-semibold text-slate-900 dark:text-white">
          Evaluar contraseña
        </h2>
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Esta evaluación se realiza localmente en tu navegador.
        </p>

        <form className="mt-4" autoComplete="off" onSubmit={onSubmit}>
          <label htmlFor="contrasena-evaluar" className="text-sm font-medium text-slate-800 dark:text-slate-100">
            Contraseña
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="contrasena-evaluar"
              className="field font-mono"
              translate="no"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              name="securepass-evaluacion"
              type={visible ? 'text' : 'password'}
              value={value}
              maxLength={128}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'evaluar-error' : undefined}
              onChange={(event) => {
                setValue(event.target.value)
                setResult(null)
              }}
            />
            <Button onClick={() => setVisible((current) => !current)} aria-pressed={visible} className="shrink-0">
              {visible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
              {visible ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
            <Button variant="primary" type="submit">
              <Search aria-hidden="true" size={16} />
              Evaluar
            </Button>
            <Button onClick={clear}>
              <Eraser aria-hidden="true" size={16} />
              Limpiar
            </Button>
          </div>
          <div className="mt-2 min-h-5" aria-live="polite">
            {error ? (
              <p id="evaluar-error" role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </form>

        <div className="mt-1 border-t border-slate-200 pt-4 dark:border-slate-700">
          <StrengthMeter id="fortaleza-evaluador" evaluation={result} />
          {result ? <p className="mt-3 text-sm text-slate-800 dark:text-slate-100">{result.summary}</p> : null}
        </div>
      </div>

      <div className="min-w-0 border-t border-slate-200 pt-5 dark:border-slate-700 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Comprobaciones</h3>
        <ul className="space-y-1.5">
          {(
            result?.checks ?? CHECK_ORDER.map((id) => ({ id, label: CHECK_LABELS[id], passed: false, detail: '' }))
          ).map((check) => {
            const pending = result === null
            return (
              <li
                key={check.id}
                className={`rounded-xl border px-3 py-2 ${
                  pending
                    ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'
                    : check.passed
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950'
                      : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5" aria-hidden="true">
                    {pending ? <Minus size={16} /> : check.passed ? <Check size={16} /> : <AlertTriangle size={16} />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {check.label}
                      <span className="ml-2 font-normal text-slate-600 dark:text-slate-300">
                        {pending ? 'Pendiente' : check.passed ? 'Correcto' : 'Revisar'}
                      </span>
                    </p>
                    {check.detail && !check.passed ? (
                      <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{check.detail}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
