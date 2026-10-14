import type { Evaluation, StrengthLevel } from '../services/passwordEvaluator'

const FILL: Record<StrengthLevel, string> = {
  weak: 'bg-red-600',
  moderate: 'bg-amber-500',
  strong: 'bg-blue-600',
  'very-strong': 'bg-emerald-600',
}

const TEXT: Record<StrengthLevel, string> = {
  weak: 'text-red-700 dark:text-red-300',
  moderate: 'text-amber-800 dark:text-amber-200',
  strong: 'text-blue-800 dark:text-blue-200',
  'very-strong': 'text-emerald-800 dark:text-emerald-200',
}

export function StrengthMeter({ id, evaluation }: { id: string; evaluation: Evaluation | null }) {
  const score = evaluation?.score ?? 0
  const label = evaluation?.levelLabel ?? 'Sin evaluar'
  const resistance =
    evaluation === null
      ? 'Sin evaluar'
      : evaluation.resistance === 'muy-alta'
        ? 'muy alta'
        : evaluation.resistance

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p id={`${id}-label`} className="text-sm font-medium text-slate-800 dark:text-slate-100">
          Fortaleza
        </p>
        <p className={`text-sm font-semibold ${evaluation ? TEXT[evaluation.level] : 'text-slate-500 dark:text-slate-400'}`}>
          {label}
          <span className="sr-only">, {score} de 4</span>
        </p>
      </div>
      <div
        role="meter"
        aria-labelledby={`${id}-label`}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={
          evaluation
            ? `${evaluation.levelLabel}. Resistencia estimada ${resistance}. ${score} de 4.`
            : 'Sin evaluar. 0 de 4.'
        }
        className="grid grid-cols-4 gap-1.5"
      >
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-2.5 rounded-full ${
              evaluation && segment <= score ? FILL[evaluation.level] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
        {evaluation ? `Resistencia estimada: ${resistance}.` : 'Todavía no hay una estimación.'}{' '}
        <span className="text-slate-600 dark:text-slate-300">Orientación aproximada, sin tiempos exactos de descifrado.</span>
      </p>
    </div>
  )
}
