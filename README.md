# DataPulse — Real-Time Data Visualization Platform

A production-grade real-time analytics dashboard built with Vue 3, TypeScript, and Apache ECharts. Simulates a unified DevOps + Security monitoring terminal with live-streaming data across four domains.

---

## Setup

```bash
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build
```

---

## Architecture

```
src/
├── types/              # Zod schemas + inferred TypeScript types
├── lib/stream.ts       # MockStreamEngine — simulates WebSocket event emitter
├── stores/index.ts     # Pinia stores (one per domain + stream status)
├── composables/
│   ├── useStream.ts    # Wires stream engine → Pinia stores, exposes controls
│   └── useThrottle.ts  # Throttles reactive refs to cap render frequency
├── components/
│   ├── charts/         # BaseChart wrapper + domain-specific chart components
│   ├── feed/           # ActivityFeed table + SeverityBadge
│   ├── controls/       # PauseResumeBtn, TimeRangeSelector, ThemeToggle
│   └── layout/         # MetricCard, ConnectionBanner
└── views/Dashboard.vue # Composes everything
```

---

## State Management Strategy

Pinia with one store per data domain:

- **metricsStore** — CPU/memory/disk rolling buffer + time range + latest snapshot
- **networkStore** — inbound/outbound rolling buffer + time range
- **cryptoStore** — per-symbol candle buffers, active symbol selector, latest price
- **securityStore** — event log (newest-first), filter string, filtered computed
- **streamStore** — connection status + paused flag (shared UI state)

Each store holds a rolling buffer capped at 300 points. Time range filtering is a `computed` slice of the buffer — no re-fetch, no extra state.

---

## Data Streaming Approach

`MockStreamEngine` is a class that mimics a WebSocket interface (`start`, `stop`, `pause`, `resume`, `on`, `off`). It uses `setInterval` and `setTimeout` chains to emit four typed event streams:

| Stream | Interval | Data |
|---|---|---|
| System metrics | 800ms | CPU, memory, disk % |
| Network traffic | 1000ms | inbound/outbound KB/s |
| Crypto candles | 1500ms | OHLC for BTC/ETH/SOL |
| Security events | 2–6s random | typed threat events |

All incoming payloads are validated with **Zod** schemas in `useStream.ts` before reaching any store. Malformed payloads are silently dropped — the UI never crashes on bad data.

Reconnect simulation uses exponential backoff (1s → 2s → 4s … max 30s).

---

## Rendering Optimization Decisions

- **ECharts `notMerge: false`** — chart updates diff the option object instead of re-initializing, eliminating flicker
- **`useThrottle` composable** — caps chart data updates at ~2.5fps (400ms) during high-frequency bursts, preventing layout thrashing
- **Rolling buffer with `shift()`** — buffer stays at ≤300 points; memory footprint is constant regardless of uptime
- **`lazyUpdate: true`** on ECharts — batches multiple rapid updates into a single render frame
- **`computed` slices** — time range filtering is derived state, not duplicated data
- **Activity feed capped at 100 visible rows** — DOM size stays fixed; store holds up to 500 events

---

## Trade-offs

| Decision | Trade-off |
|---|---|
| In-browser mock stream (no server) | No real WebSocket latency/reconnect behavior, but fully self-contained |
| ECharts over D3 | Less customizable at the primitive level, but dramatically less code for real-time use |
| Pinia over Zustand/Redux | Vue-native, simpler API — less portable to React if ever needed |
| No Web Worker | Zod validation is fast enough on main thread at these data rates; Worker would add complexity without measurable gain |
| TanStack Table not used for feed | Simple `v-for` with a capped slice is sufficient; TanStack adds value only with virtualization at 10k+ rows |

---

## Features

- ✅ Live area chart — CPU, memory, disk
- ✅ Live bar chart — network inbound/outbound
- ✅ Candlestick chart — BTC/ETH/SOL with symbol switcher
- ✅ Radar chart — security event severity distribution
- ✅ KPI metric cards with live values
- ✅ Security event feed — searchable, severity-badged, newest-first
- ✅ Pause/resume streaming
- ✅ Time range selector (1m / 5m / 15m / 1h / live)
- ✅ Dark/light mode toggle
- ✅ Connection loss banner with reconnect simulation
- ✅ Responsive layout (mobile → desktop)
- ✅ Zod payload validation + graceful error handling
- ✅ Exponential reconnect backoff
