import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import {
  RANDOM_LENGTH,
  WORD_COUNT,
  clampPassphraseLength,
  clampRandomLength,
  clampWordCount,
  generatePassphrase,
  generatePassword,
  passphraseLengthBounds,
  type PasswordMode,
  type Separator,
} from '../services/cryptoGenerator'
import { evaluatePassword } from '../services/passwordEvaluator'
import { generatorRecommendations } from '../services/recommendations'
import { StrengthMeter } from './StrengthMeter'
import { Button, CheckboxField, RangeField, SegmentedControl } from './ui'

async function copyToClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value)
    return
  }

  const field = document.createElement('textarea')
  field.value = value
  field.setAttribute('readonly', '')
  field.setAttribute('aria-hidden', 'true')
  field.className = 'clipboard-buffer'
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand('copy')
  field.remove()
  if (!copied) throw new Error('clipboard')
}

const SEPARATORS: { value: Separator; label: string }[] = [
  { value: '-', label: 'Guion' },
  { value: ' ', label: 'Espacio' },
  { value: '.', label: 'Punto' },
]

export function GeneratorTab() {
  const statusId = useId()
  const [mode, setMode] = useState<PasswordMode>('random')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true)
  const [wordCount, setWordCount] = useState(5)
  const [separator, setSeparator] = useState<Separator>('-')
  const [phraseLength, setPhraseLength] = useState(32)
  const [capitalize, setCapitalize] = useState(true)
  const [notice, setNotice] = useState('')
  const [fresh, setFresh] = useState(false)
  const [sourceMode, setSourceMode] = useState<PasswordMode>('random')
  const [usedSeparator, setUsedSeparator] = useState<Separator>('-')

  const bounds = passphraseLengthBounds(wordCount, separator)
  const safeLength = clampRandomLength(length)
  const safeWords = clampWordCount(wordCount)
  const safePhraseLength = clampPassphraseLength(phraseLength, safeWords, separator)

  useEffect(() => {
    setPhraseLength((current) => clampPassphraseLength(current, wordCount, separator))
  }, [wordCount, separator])

  useEffect(() => {
    if (copyState !== 'copied') return
    const timer = window.setTimeout(() => setCopyState('idle'), 4000)
    return () => window.clearTimeout(timer)
  }, [copyState])

  const evaluation = password ? evaluatePassword(password) : null
  const tips = generatorRecommendations(
    password ? sourceMode : mode,
    { length: safeLength, uppercase, lowercase, numbers, symbols, avoidAmbiguous },
    safeWords,
    evaluation,
  )

  function updateClass(key: 'uppercase' | 'lowercase' | 'numbers' | 'symbols', checked: boolean) {
    const next = { uppercase, lowercase, numbers, symbols, [key]: checked }
    if (!next.uppercase && !next.lowercase && !next.numbers && !next.symbols) {
      setNotice('Selecciona al menos un conjunto de caracteres.')
      return
    }
    setNotice('')
    if (key === 'uppercase') setUppercase(checked)
    if (key === 'lowercase') setLowercase(checked)
    if (key === 'numbers') setNumbers(checked)
    if (key === 'symbols') setSymbols(checked)
  }

  function generate() {
    try {
      const next =
        mode === 'random'
          ? generatePassword({
              length: safeLength,
              uppercase,
              lowercase,
              numbers,
              symbols,
              avoidAmbiguous,
            })
          : generatePassphrase({
              wordCount: safeWords,
              length: safePhraseLength,
              separator,
              capitalize,
            })
      setPassword(next)
      setVisible(true)
      setCopyState('idle')
      setFresh(true)
      setSourceMode(mode)
      setUsedSeparator(separator)
      setNotice('')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No se pudo generar la contraseña.')
    }
  }

  async function copy() {
    if (!password) return
    setCopyState('copying')
    try {
      await copyToClipboard(password)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  function selectPassword(target: HTMLElement) {
    if (!visible || !password) return
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(target)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const wordCountLabel = password ? password.split(usedSeparator).length : safeWords

  return (
    <section
      className="card grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8"
      aria-labelledby="generar-titulo"
    >
      <h2 id="generar-titulo" className="sr-only">
        Generar contraseña
      </h2>
      <div className="min-w-0">
        <SegmentedControl
          name="modo-generacion"
          label="Tipo"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'random', label: 'Contraseña aleatoria' },
            { value: 'passphrase', label: 'Frase segura' },
          ]}
        />

        <div
          className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-950"
          translate="no"
        >
          {password ? (
            <>
              <p
                className="min-h-14 cursor-text font-mono text-lg leading-relaxed text-slate-900 [overflow-wrap:anywhere] dark:text-slate-50 sm:text-xl"
                aria-hidden={visible ? undefined : true}
                onClick={(event) => selectPassword(event.currentTarget)}
              >
                {visible ? password : '•'.repeat(password.length)}
              </p>
              {visible ? null : <p className="sr-only">Contraseña oculta. Usa Mostrar para verla.</p>}
            </>
          ) : (
            <p className="min-h-14 text-base text-slate-600 dark:text-slate-300">
              Pulsa «Generar contraseña» para crear una en este dispositivo.
            </p>
          )}
          {password ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {sourceMode === 'passphrase'
                ? `${password.length} caracteres · ${wordCountLabel} palabras`
                : `${password.length} caracteres`}
              {fresh ? ' · Recién generada' : ''}
            </p>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="primary" onClick={generate} className="col-span-2 sm:col-span-1">
            <RefreshCw aria-hidden="true" size={16} />
            {password ? 'Generar otra' : 'Generar contraseña'}
          </Button>
          <Button onClick={copy} disabled={!password || copyState === 'copying'} aria-describedby={statusId}>
            <Copy aria-hidden="true" size={16} />
            {copyState === 'copying' ? 'Copiando…' : 'Copiar'}
          </Button>
          <Button onClick={() => setVisible((current) => !current)} disabled={!password} aria-pressed={visible}>
            {visible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
            {visible ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>

        <div id={statusId} aria-live="polite" className="mt-2 min-h-5">
          {fresh && copyState === 'idle' ? (
            <p className="text-sm text-slate-700 dark:text-slate-200">Nueva contraseña lista en este dispositivo.</p>
          ) : null}
          {copyState === 'copied' ? (
            <p role="status" className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Contraseña copiada al portapapeles
            </p>
          ) : null}
          {copyState === 'error' ? (
            <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
              No se pudo acceder al portapapeles. Comprueba los permisos del navegador.
            </p>
          ) : null}
          {notice ? (
            <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-300">
              {notice}
            </p>
          ) : null}
        </div>

        <div className="mt-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <StrengthMeter id="fortaleza-generador" evaluation={evaluation} />
          <h3 className="mb-1.5 mt-4 text-sm font-medium text-slate-800 dark:text-slate-100">Recomendaciones</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 marker:text-slate-400 dark:text-slate-200">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="min-w-0 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ajustes</h3>
        {mode === 'random' ? (
          <>
            <RangeField
              key="longitud-aleatoria"
              id="longitud-aleatoria"
              label="Longitud"
              min={RANDOM_LENGTH.min}
              max={RANDOM_LENGTH.max}
              value={safeLength}
              onChange={(value) => setLength(clampRandomLength(value))}
              hint="Rango recomendado: 12 a 64 caracteres."
            />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-100">Incluir</legend>
              <div className="grid grid-cols-2 gap-2">
                <CheckboxField
                  id="mayusculas"
                  label="Mayúsculas"
                  checked={uppercase}
                  onChange={(checked) => updateClass('uppercase', checked)}
                />
                <CheckboxField
                  id="minusculas"
                  label="Minúsculas"
                  checked={lowercase}
                  onChange={(checked) => updateClass('lowercase', checked)}
                />
                <CheckboxField
                  id="numeros"
                  label="Números"
                  checked={numbers}
                  onChange={(checked) => updateClass('numbers', checked)}
                />
                <CheckboxField
                  id="simbolos"
                  label="Símbolos"
                  checked={symbols}
                  onChange={(checked) => updateClass('symbols', checked)}
                />
              </div>
            </fieldset>
            <CheckboxField
              id="ambiguos"
              label="Evitar caracteres ambiguos"
              hint="Sin O, 0, I, l ni 1."
              checked={avoidAmbiguous}
              onChange={setAvoidAmbiguous}
            />
          </>
        ) : (
          <>
            <RangeField
              key="numero-palabras"
              id="numero-palabras"
              label="Número de palabras"
              min={WORD_COUNT.min}
              max={WORD_COUNT.max}
              value={safeWords}
              onChange={(value) => setWordCount(clampWordCount(value))}
              hint="Seis o más ofrecen mejor resistencia."
            />
            <RangeField
              key="longitud-frase"
              id="longitud-frase"
              label="Longitud de la frase"
              min={bounds.min}
              max={bounds.max}
              value={safePhraseLength}
              onChange={(value) => setPhraseLength(clampPassphraseLength(value, safeWords, separator))}
              hint={`Entre ${bounds.min} y ${bounds.max} caracteres, con separadores.`}
            />
            <SegmentedControl
              name="separador"
              label="Separador"
              value={separator}
              onChange={setSeparator}
              options={SEPARATORS}
            />
            <CheckboxField
              id="capitalizar"
              label="Mayúscula inicial en cada palabra"
              checked={capitalize}
              onChange={setCapitalize}
            />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Palabras en español, sin tildes ni repeticiones, en orden aleatorio.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
