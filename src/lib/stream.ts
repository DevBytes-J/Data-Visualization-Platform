import type { MetricPoint, NetworkPoint, Candle, SecurityEvent } from '@/types'

export type StreamEvent =
  | { type: 'metric';   payload: MetricPoint }
  | { type: 'network';  payload: NetworkPoint }
  | { type: 'candle';   payload: Candle }
  | { type: 'security'; payload: SecurityEvent }
  | { type: 'status';   payload: { connected: boolean } }

type Listener = (event: StreamEvent) => void

const SECURITY_TYPES = ['SSH Brute Force', 'Port Scan', 'DDoS Attempt', 'SQL Injection', 'XSS Attempt', 'Malware Detected', 'Unauthorized Access', 'Data Exfiltration']
const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const
const SOURCES = ['192.168.1.', '10.0.0.', '172.16.0.', '203.0.113.']

let _cpu = 45, _mem = 60, _disk = 30
let _in = 500, _out = 300
const _prices: Record<string, number> = { BTC: 65000, ETH: 3200, SOL: 180 }

function jitter(val: number, range: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val + (Math.random() - 0.5) * range))
}

function randomIp() {
  return SOURCES[Math.floor(Math.random() * SOURCES.length)] + Math.floor(Math.random() * 255)
}

export class MockStreamEngine {
  private listeners: Listener[] = []
  private timers: ReturnType<typeof setInterval>[] = []
  private _paused = false
  private _connected = false
  private _reconnectDelay = 1000
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null

  on(fn: Listener) { this.listeners.push(fn) }
  off(fn: Listener) { this.listeners = this.listeners.filter(l => l !== fn) }

  private emit(event: StreamEvent) {
    if (!this._paused) this.listeners.forEach(l => l(event))
  }

  start() {
    this._connected = true
    this._reconnectDelay = 1000
    this.emit({ type: 'status', payload: { connected: true } })

    this.timers.push(setInterval(() => {
      _cpu  = jitter(_cpu,  8)
      _mem  = jitter(_mem,  4)
      _disk = jitter(_disk, 1)
      this.emit({ type: 'metric', payload: { ts: Date.now(), cpu: _cpu, memory: _mem, disk: _disk } })
    }, 800))

    this.timers.push(setInterval(() => {
      _in  = jitter(_in,  120, 0, 2000)
      _out = jitter(_out, 80,  0, 1500)
      this.emit({ type: 'network', payload: { ts: Date.now(), inbound: _in, outbound: _out } })
    }, 1000))

    this.timers.push(setInterval(() => {
      for (const symbol of ['BTC', 'ETH', 'SOL'] as const) {
        const prev = _prices[symbol]
        const close = jitter(prev, prev * 0.005, prev * 0.8, prev * 1.2)
        const swing = Math.abs(close - prev) * 1.5
        _prices[symbol] = close
        this.emit({ type: 'candle', payload: {
          ts: Date.now(), symbol,
          open: prev, close,
          high: Math.max(prev, close) + swing * Math.random(),
          low:  Math.min(prev, close) - swing * Math.random(),
        }})
      }
    }, 1500))

    const scheduleEvent = () => {
      const delay = 2000 + Math.random() * 4000
      this.timers.push(setTimeout(() => {
        const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)]
        this.emit({ type: 'security', payload: {
          id: crypto.randomUUID(),
          ts: Date.now(),
          severity,
          type: SECURITY_TYPES[Math.floor(Math.random() * SECURITY_TYPES.length)],
          source: randomIp(),
          message: `Detected suspicious activity from ${randomIp()}`,
        }})
        scheduleEvent()
      }, delay))
    }
    scheduleEvent()
  }

  pause()  { this._paused = true }
  resume() { this._paused = false }
  get paused()    { return this._paused }
  get connected() { return this._connected }

  simulateDisconnect() {
    this.stop(false)
    this._connected = false
    this.emit({ type: 'status', payload: { connected: false } })
    this._scheduleReconnect()
  }

  private _scheduleReconnect() {
    this._reconnectTimer = setTimeout(() => { this.start() }, this._reconnectDelay)
    this._reconnectDelay = Math.min(this._reconnectDelay * 2, 30_000)
  }

  stop(emitStatus = true) {
    this.timers.forEach(t => clearInterval(t))
    this.timers = []
    if (this._reconnectTimer) clearTimeout(this._reconnectTimer)
    if (emitStatus) {
      this._connected = false
      this.emit({ type: 'status', payload: { connected: false } })
    }
  }
}

export const stream = new MockStreamEngine()
