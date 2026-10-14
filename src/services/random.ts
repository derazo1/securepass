/** Entero uniforme en [0, max) sin sesgo de módulo. */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error('El rango aleatorio debe ser un entero positivo.')
  }

  const limit = Math.floor(0x1_0000_0000 / max) * max
  const buffer = new Uint32Array(1)

  let value = 0
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0] ?? 0
  } while (value >= limit)

  return value % max
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1)
    const current = copy[index]
    copy[index] = copy[swapIndex] as T
    copy[swapIndex] = current as T
  }
  return copy
}
