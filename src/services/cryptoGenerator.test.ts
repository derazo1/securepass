import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  generatePassphrase,
  generatePassword,
  isPredictableWordOrder,
  passphraseLengthBounds,
} from './cryptoGenerator'
import { WORDLIST, wordsOfLength } from './wordlist'

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) return walk(path)
    if (path.endsWith('.test.ts')) return []
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : []
  })
}

describe('generación local', () => {
  it('crea contraseñas aleatorias con la longitud pedida y sin caracteres ambiguos', () => {
    const password = generatePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      avoidAmbiguous: true,
    })
    expect(password).toHaveLength(20)
    expect(password).not.toMatch(/[O0Il1]/)
    expect(password).toMatch(/[A-Z]/)
    expect(password).toMatch(/[a-z]/)
    expect(password).toMatch(/\d/)
    expect(password).toMatch(/[^A-Za-z0-9]/)
  })

  it('crea frases con el número de palabras y la longitud elegidos', () => {
    const options = { wordCount: 6, length: 40, separator: '-' as const, capitalize: true }
    const bounds = passphraseLengthBounds(6, '-')
    const phrase = generatePassphrase(options)
    const words = phrase.split('-')
    expect(words).toHaveLength(6)
    expect(phrase.length).toBeGreaterThanOrEqual(bounds.min)
    expect(phrase.length).toBeLessThanOrEqual(bounds.max)
    expect(new Set(words.map((word) => word.toLowerCase())).size).toBe(6)
    expect(words.every((word) => word[0] === word[0]?.toUpperCase())).toBe(true)
    expect(isPredictableWordOrder(words)).toBe(false)
  })

  it('rechaza órdenes predecibles de palabras', () => {
    expect(isPredictableWordOrder(['casa', 'lago', 'nube'])).toBe(true)
    expect(isPredictableWordOrder(['casa', 'coco', 'cuna'])).toBe(true)
    expect(isPredictableWordOrder(['nube', 'casa', 'lago'])).toBe(false)
  })

  it('no repite la misma frase en generaciones seguidas', () => {
    const phrases = new Set(
      Array.from({ length: 20 }, () =>
        generatePassphrase({ wordCount: 5, length: 36, separator: '-', capitalize: false }),
      ),
    )
    expect(phrases.size).toBe(20)
  })

  it('tiene palabras suficientes en cada longitud', () => {
    for (const length of [4, 5, 6, 7, 8]) {
      expect(wordsOfLength(length).length).toBeGreaterThanOrEqual(20)
    }
    expect(WORDLIST.length).toBeGreaterThan(300)
  })

  it('no usa azar inseguro ni guarda contraseñas', () => {
    const sources = walk(join(process.cwd(), 'src'))
    for (const path of sources) {
      const source = readFileSync(path, 'utf8')
      expect(source).not.toContain('Math.random')
      expect(source).not.toContain('sessionStorage')
      expect(source).not.toContain('indexedDB')
      expect(source).not.toContain('document.cookie')
      if (!path.endsWith('useTheme.ts') && !path.endsWith('main.tsx')) {
        expect(source).not.toContain('localStorage')
      }
    }
  })
})
