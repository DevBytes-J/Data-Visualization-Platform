import { z } from 'zod'

export const MetricPointSchema = z.object({
  ts: z.number(),
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  disk: z.number().min(0).max(100),
})
export type MetricPoint = z.infer<typeof MetricPointSchema>

export const NetworkPointSchema = z.object({
  ts: z.number(),
  inbound: z.number().nonnegative(),
  outbound: z.number().nonnegative(),
})
export type NetworkPoint = z.infer<typeof NetworkPointSchema>

export const CandleSchema = z.object({
  ts: z.number(),
  symbol: z.enum(['BTC', 'ETH', 'SOL']),
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
})
export type Candle = z.infer<typeof CandleSchema>

export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info'])
export type Severity = z.infer<typeof SeveritySchema>

export const SecurityEventSchema = z.object({
  id: z.string(),
  ts: z.number(),
  severity: SeveritySchema,
  type: z.string(),
  source: z.string(),
  message: z.string(),
})
export type SecurityEvent = z.infer<typeof SecurityEventSchema>

export type TimeRange = '1m' | '5m' | '15m' | '1h' | 'live'

export const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1m':   60_000,
  '5m':   300_000,
  '15m':  900_000,
  '1h':   3_600_000,
  'live': Infinity,
}
