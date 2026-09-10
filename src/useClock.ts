import { useEffect, useState } from 'react'
import { settings } from './site.config'

const format = () =>
  new Date().toLocaleTimeString('en-GB', {
    timeZone: settings.timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }) + ' BRT'

export function useClock() {
  const [clock, setClock] = useState(format)

  useEffect(() => {
    const id = setInterval(() => setClock(format()), 30000)
    return () => clearInterval(id)
  }, [])

  return clock
}
