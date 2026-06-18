import { useEffect, useState } from 'react'

/*
 * Live countdown to an ISO date-time. Recomputes every second and reports
 * when the moment has arrived.
 */
export function useCountdown(targetISO) {
  const compute = () => {
    const target = new Date(targetISO).getTime()
    const diff = target - Date.now()
    const clamped = Math.max(diff, 0)
    return {
      days: Math.floor(clamped / 86_400_000),
      hours: Math.floor((clamped % 86_400_000) / 3_600_000),
      minutes: Math.floor((clamped % 3_600_000) / 60_000),
      seconds: Math.floor((clamped % 60_000) / 1_000),
      done: diff <= 0,
    }
  }

  const [time, setTime] = useState(compute)

  useEffect(() => {
    setTime(compute())
    const id = setInterval(() => setTime(compute()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetISO])

  return time
}
