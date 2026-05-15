import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MetricPoint, NetworkPoint, Candle, SecurityEvent, TimeRange } from '@/types'
import { TIME_RANGE_MS } from '@/types'

const MAX = 300

function useRollingBuffer<T extends { ts: number }>(max = MAX) {
  const buffer = ref<T[]>([]) as ReturnType<typeof ref<T[]>>
  function push(item: T) {
    (buffer.value as T[]).push(item)
    if ((buffer.value as T[]).length > max) (buffer.value as T[]).shift()
  }
  function slice(range: TimeRange) {
    const arr = buffer.value as T[]
    if (range === 'live') return arr
    const cutoff = Date.now() - TIME_RANGE_MS[range]
    return arr.filter(p => p.ts >= cutoff)
  }
  return { buffer: buffer as import('vue').Ref<T[]>, push, slice }
}

export const useMetricsStore = defineStore('metrics', () => {
  const { buffer, push, slice } = useRollingBuffer<MetricPoint>()
  const timeRange = ref<TimeRange>('5m')
  const latest = computed(() => buffer.value[buffer.value.length - 1] ?? null)
  const visible = computed(() => slice(timeRange.value))
  return { buffer, push, timeRange, latest, visible }
})

export const useNetworkStore = defineStore('network', () => {
  const { buffer, push, slice } = useRollingBuffer<NetworkPoint>()
  const timeRange = ref<TimeRange>('5m')
  const visible = computed(() => slice(timeRange.value))
  return { buffer, push, timeRange, visible }
})

export const useCryptoStore = defineStore('crypto', () => {
  const btc = useRollingBuffer<Candle>()
  const eth = useRollingBuffer<Candle>()
  const sol = useRollingBuffer<Candle>()
  const timeRange = ref<TimeRange>('5m')
  const activeSymbol = ref<'BTC' | 'ETH' | 'SOL'>('BTC')

  function push(c: Candle) {
    if (c.symbol === 'BTC') btc.push(c)
    else if (c.symbol === 'ETH') eth.push(c)
    else sol.push(c)
  }

  const visible = computed(() => {
    const store = activeSymbol.value === 'BTC' ? btc : activeSymbol.value === 'ETH' ? eth : sol
    return store.slice(timeRange.value)
  })

  const latestPrice = computed(() => {
    const store = activeSymbol.value === 'BTC' ? btc : activeSymbol.value === 'ETH' ? eth : sol
    return store.buffer.value[store.buffer.value.length - 1]?.close ?? 0
  })

  return { push, timeRange, activeSymbol, visible, latestPrice }
})

export const useSecurityStore = defineStore('security', () => {
  const events = ref<SecurityEvent[]>([])
  const filter = ref('')
  const MAX_EVENTS = 500

  function push(e: SecurityEvent) {
    events.value.unshift(e)
    if (events.value.length > MAX_EVENTS) events.value.pop()
  }

  const filtered = computed(() => {
    if (!filter.value) return events.value
    const q = filter.value.toLowerCase()
    return events.value.filter(e =>
      e.type.toLowerCase().includes(q) ||
      e.source.includes(q) ||
      e.severity.includes(q)
    )
  })

  return { events, push, filter, filtered }
})

export const useStreamStore = defineStore('stream', () => {
  const connected = ref(false)
  const paused    = ref(false)
  const loading   = ref(true)
  return { connected, paused, loading }
})
