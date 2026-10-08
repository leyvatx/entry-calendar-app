import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { onRemoteChange } from '../lib/sync.js'

const LIVE_INTERVAL = 30_000

export default function useRequest(request, deps, { live = false } = {}) {
  const [attempt, setAttempt] = useState(0)
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, error: null })
  const key = JSON.stringify([...deps, attempt])
  const run = useEffectEvent((signal) => request?.(signal))

  useEffect(() => {
    const controller = new AbortController()
    run(controller.signal)
      ?.then((data) => setResult({ key, data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult((current) => (current.key === key ? current : { key, data: null, error }))
      })
    return () => controller.abort()
  }, [key, tick])

  useEffect(() => {
    if (!live) return
    const refresh = () => setTick((n) => n + 1)
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const timer = setInterval(refreshIfVisible, LIVE_INTERVAL)
    document.addEventListener('visibilitychange', refreshIfVisible)
    const unsubscribe = onRemoteChange(refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshIfVisible)
      unsubscribe()
    }
  }, [live])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return { data: result.data, error: result.error, loading: Boolean(request) && result.key !== key, reload }
}
