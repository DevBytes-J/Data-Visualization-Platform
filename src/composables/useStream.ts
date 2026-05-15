import { onMounted, onUnmounted } from 'vue'
import { stream, type StreamEvent } from '@/lib/stream'
import { useMetricsStore, useNetworkStore, useCryptoStore, useSecurityStore, useStreamStore } from '@/stores'
import { MetricPointSchema, NetworkPointSchema, CandleSchema, SecurityEventSchema } from '@/types'
import { useSoundAlerts } from './useSoundAlerts'
import { pushToast } from './useToasts'

export function useStream() {
  const metrics     = useMetricsStore()
  const network     = useNetworkStore()
  const crypto      = useCryptoStore()
  const security    = useSecurityStore()
  const streamStore = useStreamStore()
  const { alertCritical, alertHigh } = useSoundAlerts()

  function handleEvent(event: StreamEvent) {
    try {
      if (event.type === 'metric') {
        metrics.push(MetricPointSchema.parse(event.payload))
        streamStore.loading = false
      } else if (event.type === 'network') {
        network.push(NetworkPointSchema.parse(event.payload))
      } else if (event.type === 'candle') {
        crypto.push(CandleSchema.parse(event.payload))
      } else if (event.type === 'security') {
        const e = SecurityEventSchema.parse(event.payload)
        security.push(e)
        if (e.severity === 'critical') { alertCritical(); pushToast({ severity: 'critical', type: e.type, source: e.source }) }
        else if (e.severity === 'high') { alertHigh(); pushToast({ severity: 'high', type: e.type, source: e.source }) }
      } else if (event.type === 'status') {
        streamStore.connected = event.payload.connected
        if (!event.payload.connected) streamStore.loading = true
      }
    } catch {}
  }

  onMounted(() => { stream.on(handleEvent); stream.start() })
  onUnmounted(() => { stream.off(handleEvent); stream.stop() })

  function togglePause() {
    if (stream.paused) { stream.resume(); streamStore.paused = false }
    else               { stream.pause();  streamStore.paused = true  }
  }

  function simulateDisconnect() { stream.simulateDisconnect() }

  return { togglePause, simulateDisconnect }
}
