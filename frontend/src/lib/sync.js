const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('agenda')

export const notifyChange = () => channel?.postMessage('change')

export function onRemoteChange(callback) {
  channel?.addEventListener('message', callback)
  return () => channel?.removeEventListener('message', callback)
}
