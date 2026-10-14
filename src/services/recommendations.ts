import type { Evaluation } from './passwordEvaluator'
import type { PasswordMode, RandomOptions } from './cryptoGenerator'

export function generatorRecommendations(
  mode: PasswordMode,
  options: RandomOptions,
  wordCount: number,
  evaluation: Evaluation | null,
): string[] {
  if (!evaluation) {
    return [
      'La contraseña se crea en este navegador y no se guarda.',
      'Evita reutilizar esta contraseña.',
      'No compartas esta contraseña.',
    ]
  }

  const tips: string[] = []

  if (mode === 'passphrase') {
    if (wordCount < 6 || evaluation.level === 'weak' || evaluation.level === 'moderate') {
      tips.push('Añade más palabras para mejorar la seguridad de la frase.')
    }
    if (evaluation.level === 'weak' || evaluation.level === 'moderate') {
      tips.push('Aumenta la longitud de la frase para mejorar la seguridad.')
    }
    tips.push('No uses citas ni frases conocidas.')
  } else {
    const missingClass =
      !options.uppercase || !options.lowercase || !options.numbers || !options.symbols
    if (options.length < 16 || evaluation.level === 'weak' || evaluation.level === 'moderate') {
      tips.push('Aumenta la longitud para mejorar la seguridad.')
    }
    if (missingClass && evaluation.level !== 'very-strong') {
      tips.push('Incluye más tipos de caracteres si el sistema lo permite.')
    }
  }

  tips.push('Evita reutilizar esta contraseña.')
  tips.push('No compartas esta contraseña.')

  return [...new Set(tips)].slice(0, 4)
}
