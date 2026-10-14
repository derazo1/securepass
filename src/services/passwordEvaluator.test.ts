import { describe, expect, it } from 'vitest'
import { evaluatePassword } from './passwordEvaluator'

function failed(password: string, id: string): boolean {
  const result = evaluatePassword(password)
  return result.checks.some((check) => check.id === id && !check.passed)
}

describe('evaluatePassword', () => {
  it('marca como débil una palabra habitual con números', () => {
    const result = evaluatePassword('Password123')
    expect(result.level).toBe('weak')
    expect(result.resistance).toBe('baja')
    expect(failed('Password123', 'dictionary')).toBe(true)
    expect(result.summary.toLowerCase()).not.toMatch(/\d+\s*(segundos|minutos|horas|años)/)
  })

  it('detecta secuencias de teclado', () => {
    expect(failed('qwerty', 'keyboard')).toBe(true)
    expect(failed('asdfgh', 'keyboard')).toBe(true)
    expect(failed('qwerty123', 'keyboard')).toBe(true)
    expect(failed('qwerty123', 'sequence')).toBe(true)
    expect(evaluatePassword('qwerty123').level).toBe('weak')
  })

  it('detecta repeticiones y series simples', () => {
    expect(failed('aaaaaaa', 'repetition')).toBe(true)
    expect(failed('abcabcabc', 'repetition')).toBe(true)
    expect(failed('abcdef', 'sequence')).toBe(true)
    expect(failed('123456', 'sequence')).toBe(true)
    expect(failed('987654', 'sequence')).toBe(true)
  })

  it('reconoce una frase de varias palabras sin tratarla como una sola palabra común', () => {
    const result = evaluatePassword('nube-reloj-campo-vela-barco')
    expect(failed('nube-reloj-campo-vela-barco', 'dictionary')).toBe(false)
    expect(result.level === 'strong' || result.level === 'very-strong' || result.level === 'moderate').toBe(true)
    expect(result.resistanceLabel).toMatch(/resistencia estimada/)
  })

  it('valora como fuerte una contraseña larga y variada', () => {
    const result = evaluatePassword('k9#mQ2$vL7!pR4&wZ')
    expect(result.checks.every((check) => check.passed)).toBe(true)
    expect(result.level === 'strong' || result.level === 'very-strong').toBe(true)
  })

  it('advierte un año pegado a una palabra habitual', () => {
    expect(failed('verano2024', 'dictionary')).toBe(true)
    expect(evaluatePassword('verano2024').level).toBe('weak')
  })
})
