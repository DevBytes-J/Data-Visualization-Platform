<script setup lang="ts">
import { computed } from 'vue'
import { useCryptoStore } from '@/stores'
import { useThrottle } from '@/composables/useThrottle'
import BaseChart from './BaseChart.vue'
import type { EChartsOption } from 'echarts'

const store = useCryptoStore()
const data  = useThrottle(computed(() => store.visible), 400)

const option = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  animation: true,
  animationDuration: 200,
  grid: { top: 30, right: 16, bottom: 40, left: 80 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' },
    formatter: (params: unknown) => {
      const p = (params as { data: number[] }[])[0]
      if (!p) return ''
      const [o, c, l, h] = p.data
      return `O: ${o?.toFixed(2)}  C: ${c?.toFixed(2)}<br/>L: ${l?.toFixed(2)}  H: ${h?.toFixed(2)}`
    },
  },
  xAxis: {
    type: 'category',
    data: data.value.map(p => new Date(p.ts).toLocaleTimeString()),
    axisLabel: { color: '#64748b', fontSize: 10 },
    axisLine: { lineStyle: { color: '#334155' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value', scale: true,
    axisLabel: { color: '#64748b', fontSize: 10 },
    splitLine: { lineStyle: { color: '#1e293b' } },
  },
  series: [{
    type: 'candlestick',
    data: data.value.map(p => [p.open, p.close, p.low, p.high]),
    itemStyle: {
      color: '#10b981', color0: '#f43f5e',
      borderColor: '#10b981', borderColor0: '#f43f5e',
    },
  }],
  dataZoom: [{ type: 'inside', start: 0, end: 100 }],
}))
</script>

<template>
  <div v-if="data.length === 0" class="flex items-center justify-center h-[260px] text-stone-400 text-sm">
    Waiting for data…
  </div>
  <BaseChart v-else :option="option" height="260px" />
</template>
