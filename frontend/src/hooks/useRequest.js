import { useCallback, useEffect, useEffectEvent, useState } from 'react'

export default function useRequest(request, deps) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, data: null, error: null })
  const key = JSON.stringify([...deps, attempt])
  const run = useEffectEvent((signal) => request?.(signal))

  useEffect(() => {
    const controller = new AbortController()
    run(controller.signal)
      ?.then((data) => setResult({ key, data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ key, data: null, error })
      })
    return () => controller.abort()
  }, [key])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return { data: result.data, error: result.error, loading: Boolean(request) && result.key !== key, reload }
}
