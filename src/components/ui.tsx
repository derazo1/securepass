import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
} as const

export function Button({ variant = 'secondary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${VARIANTS[variant]} ${className}`} {...props} />
}

type SegmentOption<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  name,
}: {
  label: string
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  name: string
}) {
  return (
    <div>
      <p id={`${name}-label`} className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={`${name}-label`} className="flex gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-center text-sm font-medium ${
                selected
                  ? 'border-blue-700 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-100'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
              onClick={() => onChange(option.value)}
            >
              {option.icon}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CheckboxField({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer gap-2.5 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-4 w-4 accent-blue-700"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-300">{hint}</span> : null}
      </span>
    </label>
  )
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  hint?: string
}) {
  const [text, setText] = useState(String(value))
  const [adjustment, setAdjustment] = useState('')

  useEffect(() => {
    setText(String(value))
  }, [value])

  function commit(raw: string) {
    const parsed = Number(raw)
    if (raw.trim() === '' || !Number.isFinite(parsed)) {
      setText(String(value))
      setAdjustment('Introduce un número dentro del rango indicado.')
      return
    }
    const next = Math.min(max, Math.max(min, Math.round(parsed)))
    setAdjustment(next === parsed ? '' : `Se ajustó al rango de ${min} a ${max}.`)
    setText(String(next))
    onChange(next)
  }

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {label}
        </label>
        <input
          aria-label={`${label}, valor numérico`}
          className="field w-20 text-center"
          inputMode="numeric"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit(event.currentTarget.value)
            }
          }}
        />
      </div>
      <input
        id={id}
        type="range"
        className="w-full accent-blue-700"
        min={min}
        max={max}
        value={Math.min(max, Math.max(min, value))}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(min, value))}
      />
      {hint ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{hint}</p> : null}
      {adjustment ? (
        <p role="status" className="mt-1 text-sm text-slate-700 dark:text-slate-200">
          {adjustment}
        </p>
      ) : null}
    </div>
  )
}
