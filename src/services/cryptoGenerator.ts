import { MAX_WORD_LENGTH, MIN_WORD_LENGTH, WORDLIST, wordsOfLength } from './wordlist'
import { randomInt, shuffle } from './random'

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz'
const NUMBERS = '23456789'
const SYMBOLS = '!@#$%^&*()-_=+[]:;,.?'

const AMBIGUOUS = new Set(['O', '0', 'I', 'l', '1'])

export type PasswordMode = 'random' | 'passphrase'

export type Separator = '-' | '.' | ' '

export type RandomOptions = {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  avoidAmbiguous: boolean
}

export type PassphraseOptions = {
  wordCount: number
  length: number
  separator: Separator
  capitalize: boolean
}

export const RANDOM_LENGTH = { min: 12, max: 64 }
export const WORD_COUNT = { min: 4, max: 8 }

function withoutAmbiguous(source: string, avoidAmbiguous: boolean): string {
  if (!avoidAmbiguous) return source
  return [...source].filter((character) => !AMBIGUOUS.has(character)).join('')
}

function poolsFor(options: RandomOptions): string[] {
  const selected: string[] = []
  if (options.uppercase) selected.push(withoutAmbiguous(UPPERCASE + 'OI', options.avoidAmbiguous))
  if (options.lowercase) selected.push(withoutAmbiguous(LOWERCASE + 'l', options.avoidAmbiguous))
  if (options.numbers) selected.push(withoutAmbiguous(NUMBERS + '01', options.avoidAmbiguous))
  if (options.symbols) selected.push(SYMBOLS)

  return selected.filter((pool) => pool.length > 0)
}

export function clampRandomLength(length: number): number {
  if (!Number.isFinite(length)) return 16
  return Math.min(RANDOM_LENGTH.max, Math.max(RANDOM_LENGTH.min, Math.round(length)))
}

export function clampWordCount(wordCount: number): number {
  if (!Number.isFinite(wordCount)) return 5
  return Math.min(WORD_COUNT.max, Math.max(WORD_COUNT.min, Math.round(wordCount)))
}

export function passphraseLengthBounds(wordCount: number, separator: string): { min: number; max: number } {
  const count = clampWordCount(wordCount)
  const separatorCost = separator.length * (count - 1)
  return {
    min: count * MIN_WORD_LENGTH + separatorCost,
    max: count * MAX_WORD_LENGTH + separatorCost,
  }
}

export function clampPassphraseLength(length: number, wordCount: number, separator: string): number {
  const bounds = passphraseLengthBounds(wordCount, separator)
  if (!Number.isFinite(length)) return Math.round((bounds.min + bounds.max) / 2)
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(length)))
}

export function generatePassword(options: RandomOptions): string {
  const length = clampRandomLength(options.length)
  const pools = poolsFor(options)
  if (pools.length === 0) {
    throw new Error('Selecciona al menos un conjunto de caracteres.')
  }

  const combined = pools.join('')
  const characters = pools.map((pool) => pool[randomInt(pool.length)] ?? '')

  while (characters.length < length) {
    characters.push(combined[randomInt(combined.length)] ?? '')
  }

  return shuffle(characters).join('')
}

function planWordLengths(wordCount: number, budget: number): number[] {
  const lengths = Array.from({ length: wordCount }, () => MIN_WORD_LENGTH)
  let extra = budget - wordCount * MIN_WORD_LENGTH
  let cursor = randomInt(wordCount)
  let guard = 0

  while (extra > 0 && guard < wordCount * 8) {
    if ((lengths[cursor] ?? MIN_WORD_LENGTH) < MAX_WORD_LENGTH) {
      lengths[cursor] = (lengths[cursor] ?? MIN_WORD_LENGTH) + 1
      extra -= 1
    }
    cursor = (cursor + 1) % wordCount
    guard += 1
  }

  return lengths
}

function pickWord(length: number, used: Set<string>): string | null {
  const available = wordsOfLength(length).filter((word) => !used.has(word))
  if (available.length === 0) return null
  return available[randomInt(available.length)] ?? null
}

export function isPredictableWordOrder(words: readonly string[]): boolean {
  if (words.length < 2) return false
  const normalized = words.map((word) => word.toLowerCase())
  if (new Set(normalized).size !== normalized.length) return true

  const sorted = [...normalized].sort((a, b) => a.localeCompare(b, 'es'))
  if (normalized.join('\0') === sorted.join('\0')) return true
  if (normalized.join('\0') === [...sorted].reverse().join('\0')) return true
  if (new Set(normalized.map((word) => word[0])).size === 1) return true

  return false
}

function buildPassphrase(options: PassphraseOptions): string {
  const wordCount = clampWordCount(options.wordCount)
  const length = clampPassphraseLength(options.length, wordCount, options.separator)
  const separatorCost = options.separator.length * (wordCount - 1)
  const lengths = planWordLengths(wordCount, length - separatorCost)
  const used = new Set<string>()
  const words: string[] = []

  for (let index = 0; index < lengths.length; index += 1) {
    const desired = lengths[index] ?? MIN_WORD_LENGTH
    let chosen = pickWord(desired, used)

    if (!chosen) {
      for (let distance = 1; distance <= 4 && !chosen; distance += 1) {
        chosen = pickWord(desired + distance, used) ?? pickWord(desired - distance, used)
      }
    }

    if (!chosen) {
      const fallback = WORDLIST.filter((word) => !used.has(word))
      chosen = fallback[randomInt(fallback.length)] ?? 'nube'
    }

    used.add(chosen)
    words.push(options.capitalize ? chosen.charAt(0).toUpperCase() + chosen.slice(1) : chosen)
  }

  return words.join(options.separator)
}

export function generatePassphrase(options: PassphraseOptions): string {
  let phrase = ''
  for (let attempt = 0; attempt < 16; attempt += 1) {
    phrase = buildPassphrase(options)
    const words = phrase.split(options.separator)
    if (!isPredictableWordOrder(words)) return phrase
  }
  return phrase
}
