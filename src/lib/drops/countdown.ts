export interface CountdownParts {
  totalMs: number
  expired: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getCountdownParts(
  target: Date | null,
  now: Date = new Date(),
): CountdownParts | null {
  if (!target) return null

  const totalMs = target.getTime() - now.getTime()
  if (totalMs <= 0) {
    return {
      totalMs: 0,
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  let rest = Math.floor(totalMs / 1000)
  const days = Math.floor(rest / 86400)
  rest %= 86400
  const hours = Math.floor(rest / 3600)
  rest %= 3600
  const minutes = Math.floor(rest / 60)
  const seconds = rest % 60

  return {
    totalMs,
    expired: false,
    days,
    hours,
    minutes,
    seconds,
  }
}

export function formatCountdownDisplay(parts: CountdownParts): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  if (parts.days > 0) {
    return `${parts.days}z ${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
  }
  return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
}
