import { describe, expect, it } from 'vitest'
import { generatePassphrase, generatePassword } from './cryptoGenerator'
import { evaluatePassword, isPassphraseShape } from './passwordEvaluator'

describe('coherencia entre generador y evaluador', () => {
  it('las contraseñas aleatorias con todos los tipos de caracteres salen fuertes o muy fuertes', () => {
    for (let i = 0; i < 3000; i += 1) {
      const length = 12 + (i % 53)
      const password = generatePassword({
        length,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        avoidAmbiguous: i % 2 === 0,
      })
      const result = evaluatePassword(password)
      const { level } = result
      const failed = result.checks.filter((check) => !check.passed).map((check) => check.id)
      expect(level === 'strong' || level === 'very-strong', `${level} ${password} falla: ${failed.join(',')}`).toBe(true)
    }
  })

  it('un fragmento corto que coincide con una palabra común no hunde una contraseña larga', () => {
    const { level } = evaluatePassword('[,atD,$8L,@9:H:-%-6dwSOL_Uw8k$]bA,[]6*gLK-%X;2b[),f&K)4')
    expect(level).toBe('very-strong')
    expect(evaluatePassword('Sol2024!').level).toBe('weak')
  })

  it('las contraseñas aleatorias no se confunden con frases', () => {
    expect(isPassphraseShape('g+YM-]$3kD_(2o5@Fzc8[uE#zGF%cKCJ+pr_UDijsr=GrazA?VeYE^%*B7y')).toBe(false)
  })

  it('las frases generadas se reconocen como frases', () => {
    for (const separator of ['-', ' ', '.'] as const) {
      for (const capitalize of [true, false]) {
        const phrase = generatePassphrase({ wordCount: 5, length: 32, separator, capitalize })
        expect(isPassphraseShape(phrase), phrase).toBe(true)
      }
    }
  })
})
