/** Nearest-rank percentile of `values` (0 to 100); null when there is nothing to rank. */
export function percentile(values: readonly number[], rank: number): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((rank / 100) * sorted.length) - 1)
  )
  return sorted[index] ?? null
}

export const median = (values: readonly number[]) => percentile(values, 50)

/** Rounds to `digits` decimals, keeping null. */
export function round(value: number | null, digits = 1): number | null {
  if (value === null || !Number.isFinite(value)) return null
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

/** Waits `ms` milliseconds. */
export function pause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const MIB = 1024 * 1024

export const toMiB = (bytes: number) => round(bytes / MIB, 1) ?? 0
