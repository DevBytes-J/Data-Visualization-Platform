<script setup lang="ts">
import { computed } from 'vue'
import { useNetworkStore } from '@/stores'
import { useThrottle } from '@/composables/useThrottle'
import BaseChart from './BaseChart.vue'
import type { EChartsOption } from 'echarts'

const store = useNetworkStore()
const data  = useThrottle(computed(() => store.visible), 400)

const option = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  animation: true,
  animationDuration: 200,
  grid: { top: 36, right: 16, bottom: 56, left: 60 },
  tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
  legend: {
    data: ['Inbound', 'Outbound'],
    textStyle: { color: '#94a3b8' },
    top: 4,
    selectedMode: true,  // click to toggle each dataset
  },
  dataZoom: [{ type: 'inside', start: 0, end: 100 }],
  xAxis: {
    type: 'category',
    data: data.value.map(p => new Date(p.ts).toLocaleTimeString()),
    axisLabel: { color: '#64748b', fontSize: 10 },
    axisLine: { lineStyle: { color: '#334155' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#64748b', fontSize: 10, formatter: (v: number) => `${v.toFixed(0)} KB/s` },
    splitLine: { lineStyle: { color: '#1e293b' } },
  },
  series: [
    {
      name: 'Inbound', type: 'bar',
      data: data.value.map(p => p.inbound.toFixed(1)),
      itemStyle: { color: '#10b981' },
    },
    {
      name: 'Outbound', type: 'bar',
      data: data.value.map(p => p.outbound.toFixed(1)),
      itemStyle: { color: '#f43f5e' },
    },
  ],
}))
</script>

<template>
  <div v-if="data.length === 0" class="flex items-center justify-center h-[260px] text-stone-400 text-sm">
    Waiting for data…
  </div>
  <BaseChart v-else :option="option" height="260px" />
</template>
