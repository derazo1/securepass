export type StrengthLevel = 'weak' | 'moderate' | 'strong' | 'very-strong'

export type Resistance = 'baja' | 'media' | 'alta' | 'muy-alta'

export type CheckId =
  | 'length'
  | 'variety'
  | 'repetition'
  | 'dictionary'
  | 'keyboard'
  | 'sequence'

export type CheckResult = {
  id: CheckId
  label: string
  passed: boolean
  detail: string
}

export type Evaluation = {
  level: StrengthLevel
  levelLabel: string
  resistance: Resistance
  resistanceLabel: string
  score: number
  checks: CheckResult[]
  summary: string
}

export const CHECK_LABELS: Record<CheckId, string> = {
  length: 'Longitud suficiente',
  variety: 'Buena variedad de caracteres',
  repetition: 'No contiene repeticiones excesivas',
  dictionary: 'No parece una palabra o patrón común',
  keyboard: 'No parece una secuencia de teclado',
  sequence: 'No contiene secuencias numéricas o alfabéticas simples',
}

const COMMON_PASSWORDS = new Set(
  [
    'password',
    'contrasena',
    'qwerty',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
    'login',
    'princess',
    'football',
    'shadow',
    'sunshine',
    'iloveyou',
    'trustno1',
    'abc123',
    '123456',
    '12345678',
    '123456789',
    'password1',
    'passw0rd',
    'admin123',
    'root',
    'guest',
    'usuario',
    'clave',
    'secreto',
    'temporal',
    'verano',
    'invierno',
    'primavera',
    'otono',
    'barcelona',
    'madrid',
    'espana',
    'mexico',
    'empresa',
    'oficina',
    'trabajo',
    'familia',
    'tequiero',
    'futbol',
    'realmadrid',
    'changeme',
    'default',
    'system',
    'server',
    'internet',
    'computer',
    'freedom',
    'whatever',
    'access',
    'hello',
    'superman',
    'batman',
    'starwars',
    'pokemon',
    'mercedes',
    'ferrari',
    'mustang',
    'hunter',
    'pepper',
    'soccer',
    'jordan',
    'michael',
    'andrew',
    'daniel',
    'charlie',
    'hola',
    'amor',
    'casa',
    'dios',
    'jesus',
    'maria',
    'carlos',
    'inicio',
    'sesion',
    'cambiar',
    'prueba',
    'invitado',
    'administrador',
    'bienvenido',
    'sol',
    'luna',
    'perro',
    'gato',
  ].map((word) => fold(word)),
)

const KEYBOARD_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'asdfghjklñ']

const DOMINANT_PASSWORDS = [
  'password',
  'contrasena',
  'qwerty',
  'letmein',
  'welcome',
  'iloveyou',
  'admin',
  '123456',
  '12345678',
  '123456789',
]

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function leetFold(value: string): string {
  return fold(value)
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[7]/g, 't')
}

export function splitWords(password: string): string[] {
  const spaced = password.replace(/([a-zñ])([A-ZÑ])/g, '$1 $2').replace(/[0-9]+/g, ' ')
  return fold(spaced)
    .split(/[^a-z]+/)
    .filter((word) => word.length >= 3)
}

const WORD_PART = /^(?:[a-záéíóúüñ]{3,}|[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]{2,}|[A-ZÁÉÍÓÚÜÑ]{3,})$/

/** Solo cuenta como frase si está formada por palabras completas, no por fragmentos de letras sueltos. */
export function isPassphraseShape(password: string): boolean {
  const body = password.trim().replace(/[0-9!?]+$/, '')
  if (body.length < 16) return false

  const separated = body.split(/[\s\-._,]+/)
  if (separated.length >= 3 && separated.every((part) => WORD_PART.test(part))) return true

  return /^(?:[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]{2,}){3,}$/.test(body)
}

function characterClasses(password: string): number {
  let count = 0
  if (/[a-zñ]/.test(password)) count += 1
  if (/[A-ZÑ]/.test(password)) count += 1
  if (/\d/.test(password)) count += 1
  if (/[^A-Za-zÑñ0-9]/.test(password)) count += 1
  return count
}

function longestSameRun(value: string): number {
  let best = 1
  let run = 1
  for (let index = 1; index < value.length; index += 1) {
    if (value[index] === value[index - 1]) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return value.length === 0 ? 0 : best
}

function hasRepeatedBlock(value: string): boolean {
  const sizeLimit = Math.floor(value.length / 2)
  for (let size = 1; size <= sizeLimit; size += 1) {
    for (let start = 0; start + size * 2 <= value.length; start += 1) {
      const block = value.slice(start, start + size)
      let repeats = 1
      while (value.slice(start + repeats * size, start + (repeats + 1) * size) === block) {
        repeats += 1
      }
      const covered = repeats * size
      if (repeats >= 3 || (repeats >= 2 && covered >= 6 && covered / value.length >= 0.5)) {
        return true
      }
    }
  }
  return false
}

function longestMonotonicRun(value: string, isRelevant: (character: string) => boolean): number {
  let best = 1
  let run = 1
  let direction = 0

  for (let index = 1; index < value.length; index += 1) {
    const previous = value[index - 1] ?? ''
    const current = value[index] ?? ''
    if (!isRelevant(previous) || !isRelevant(current)) {
      run = 1
      direction = 0
      continue
    }

    const delta = current.charCodeAt(0) - previous.charCodeAt(0)
    if (delta === 1 || delta === -1) {
      if (direction === 0 || direction === delta) {
        direction = delta
        run += 1
        best = Math.max(best, run)
      } else {
        direction = delta
        run = 2
      }
    } else {
      direction = 0
      run = 1
    }
  }

  return value.length === 0 ? 0 : best
}

function longestKeyboardWalk(value: string): number {
  const lowered = fold(value)
  const lines = KEYBOARD_ROWS.flatMap((row) => [row, [...row].reverse().join('')])
  let best = 1

  for (const line of lines) {
    for (let size = Math.min(line.length, lowered.length); size >= 4; size -= 1) {
      for (let index = 0; index + size <= lowered.length; index += 1) {
        if (line.includes(lowered.slice(index, index + size))) {
          best = Math.max(best, size)
        }
      }
      if (best >= size) break
    }
  }

  return lowered.length === 0 ? 0 : best
}

function isSignificant(run: number, length: number): boolean {
  if (run >= 5) return true
  if (run >= 4 && (length <= 16 || run / Math.max(length, 1) >= 0.25)) return true
  return run >= 3 && length <= 10
}

type DictionaryIssue = 'exact' | 'contained' | null

function dictionaryIssue(password: string): DictionaryIssue {
  const folded = fold(password)
  const compact = folded.replace(/[^a-z0-9]/g, '')
  const leet = leetFold(password).replace(/[^a-z0-9]/g, '')
  const words = splitWords(password)

  const reducesToCommon = (value: string): boolean => {
    const stripped = value.replace(/(19|20)\d{2}$/g, '').replace(/\d+$/g, '')
    if (COMMON_PASSWORDS.has(value) || COMMON_PASSWORDS.has(stripped)) return true
    const covered = words.reduce((total, word) => total + word.length, 0)
    if (covered / Math.max(password.length, 1) < 0.5) return false
    if (words.length === 1 && COMMON_PASSWORDS.has(words[0] ?? '')) return true
    if (words.length === 2 && words.every((word) => COMMON_PASSWORDS.has(word))) return true
    return false
  }

  if (reducesToCommon(compact) || reducesToCommon(leet)) return 'exact'

  if (isPassphraseShape(password)) {
    const joined = words.join('')
    if (COMMON_PASSWORDS.has(joined)) return 'exact'
    if (DOMINANT_PASSWORDS.some((item) => compact.includes(item) || leet.includes(item))) return 'contained'
    return null
  }

  const letters = leet.replace(/[^a-z]/g, '')
  for (const word of COMMON_PASSWORDS) {
    if (word.length >= 5 && letters.includes(word) && word.length / Math.max(letters.length, 1) >= 0.55) {
      return password.length >= 20 ? 'contained' : 'exact'
    }
  }

  return null
}

function charsetSize(password: string): number {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/\d/.test(password)) size += 10
  if (/[^A-Za-z0-9]/.test(password)) size += 28
  return Math.max(size, 2)
}

function estimateBits(password: string, classes: number, words: string[]): number {
  const phraseLike = isPassphraseShape(password)
  let bits = phraseLike ? words.length * 11 : password.length * Math.log2(charsetSize(password))

  if (!phraseLike && classes === 1) bits *= 0.55
  else if (!phraseLike && classes === 2) bits *= 0.8

  const unique = new Set(password).size
  if (!phraseLike && password.length >= 8 && unique <= Math.max(3, password.length * 0.25)) {
    bits *= 0.7
  }

  return bits
}

function levelFromBits(bits: number): StrengthLevel {
  if (bits < 28) return 'weak'
  if (bits < 45) return 'moderate'
  if (bits < 64) return 'strong'
  return 'very-strong'
}

const LEVEL_LABELS: Record<StrengthLevel, string> = {
  weak: 'Débil',
  moderate: 'Moderada',
  strong: 'Fuerte',
  'very-strong': 'Muy fuerte',
}

const RESISTANCE_BY_LEVEL: Record<StrengthLevel, Resistance> = {
  weak: 'baja',
  moderate: 'media',
  strong: 'alta',
  'very-strong': 'muy-alta',
}

const RESISTANCE_LABELS: Record<Resistance, string> = {
  baja: 'baja resistencia estimada',
  media: 'media resistencia estimada',
  alta: 'alta resistencia estimada',
  'muy-alta': 'muy alta resistencia estimada',
}

const SCORE: Record<StrengthLevel, number> = {
  weak: 1,
  moderate: 2,
  strong: 3,
  'very-strong': 4,
}

function check(id: CheckId, passed: boolean, detail: string): CheckResult {
  return { id, label: CHECK_LABELS[id], passed, detail }
}

export function evaluatePassword(password: string): Evaluation {
  const length = password.length
  const classes = characterClasses(password)
  const words = splitWords(password)
  const phraseLike = isPassphraseShape(password)
  const sameRun = longestSameRun(password)
  const letterRun = longestMonotonicRun(password, (character) => /[a-z]/i.test(character))
  const digitRun = longestMonotonicRun(password, (character) => /\d/.test(character))
  const keyboardRun = longestKeyboardWalk(password)
  const dictionary = dictionaryIssue(password)
  const repeated = sameRun >= 3 || hasRepeatedBlock(password.toLowerCase())
  const keyboard = isSignificant(keyboardRun, length)
  const sequence = isSignificant(letterRun, length) || isSignificant(digitRun, length)

  const checks: CheckResult[] = [
    check(
      'length',
      length >= 12,
      length >= 12
        ? 'Tiene al menos 12 caracteres.'
        : 'Usa al menos 12 caracteres. A partir de 16 mejora con claridad.',
    ),
    check(
      'variety',
      classes >= 3 || phraseLike,
      classes >= 3 || phraseLike
        ? phraseLike
          ? 'La frase reúne varias palabras distintas.'
          : 'Combina varios tipos de caracteres.'
        : 'Combina mayúsculas, minúsculas, números y símbolos, o varias palabras distintas.',
    ),
    check(
      'repetition',
      !repeated,
      repeated
        ? 'Hay caracteres o bloques repetidos que facilitan la adivinación.'
        : 'No hay repeticiones ni bloques redundantes.',
    ),
    check(
      'dictionary',
      dictionary === null,
      dictionary === null
        ? 'No coincide con una palabra o contraseña habitual.'
        : 'Se parece a una palabra, contraseña habitual o una variante sencilla.',
    ),
    check(
      'keyboard',
      !keyboard,
      keyboard
        ? 'Incluye un recorrido de teclas contiguas, como las de una fila del teclado.'
        : 'No sigue un recorrido de teclado.',
    ),
    check(
      'sequence',
      !sequence,
      sequence
        ? 'Incluye una serie simple, como abcd o 1234.'
        : 'No contiene series numéricas ni alfabéticas simples.',
    ),
  ]

  let bits = estimateBits(password, classes, words)
  if (length < 12) bits = Math.min(bits, 22)
  if (repeated) bits -= 12
  if (keyboard) bits -= 14
  if (sequence) bits -= 12
  if (dictionary === 'exact') bits = Math.min(bits - 8, length < 16 ? 18 : 34)
  if (dictionary === 'contained') bits -= 15

  const level = levelFromBits(Math.max(bits, 0))
  const resistance = RESISTANCE_BY_LEVEL[level]
  const patternFailed = checks.some(
    (item) => !item.passed && item.id !== 'length' && item.id !== 'variety',
  )

  let summary = 'La resistencia estimada es una orientación. No representa un tiempo exacto de descifrado.'
  if (level === 'weak') {
    summary = patternFailed
      ? 'Resultado débil: hay patrones fáciles de reconocer. Conviene elegir otra combinación.'
      : 'Resultado débil. Aumenta la longitud y combina distintos tipos de caracteres.'
  } else if (level === 'moderate') {
    summary = 'Resistencia media. Puede mejorar si alargas la contraseña o evitas patrones.'
  } else if (level === 'strong') {
    summary = 'Buena resistencia estimada. No la reutilices ni la compartas.'
  } else {
    summary = 'Muy buena resistencia estimada. Guárdala solo en un lugar de confianza.'
  }

  return {
    level,
    levelLabel: LEVEL_LABELS[level],
    resistance,
    resistanceLabel: RESISTANCE_LABELS[resistance],
    score: SCORE[level],
    checks,
    summary,
  }
}
