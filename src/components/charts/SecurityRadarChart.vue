<script setup lang="ts">
import { computed } from 'vue'
import { useSecurityStore } from '@/stores'
import BaseChart from './BaseChart.vue'
import type { EChartsOption } from 'echarts'

const store = useSecurityStore()

const counts = computed(() => {
  const c = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  store.events.forEach(e => c[e.severity]++)
  return c
})

const option = computed<EChartsOption>(() => {
  const c = counts.value
  const maxVal = (v: number) => Math.max(10, Math.ceil(v * 1.3))
  return {
  backgroundColor: 'transparent',
  animation: true,
  tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
  radar: {
    indicator: [
      { name: 'Critical', max: maxVal(c.critical) },
      { name: 'High',     max: maxVal(c.high) },
      { name: 'Medium',   max: maxVal(c.medium) },
      { name: 'Low',      max: maxVal(c.low) },
      { name: 'Info',     max: maxVal(c.info) },
    ],
    axisName: { color: '#94a3b8', fontSize: 11 },
    splitLine: { lineStyle: { color: '#1e293b' } },
    splitArea: { areaStyle: { color: ['#0f172a', '#1e293b'] } },
    axisLine: { lineStyle: { color: '#334155' } },
  },
  series: [{
    type: 'radar',
    data: [{
      value: [c.critical, c.high, c.medium, c.low, c.info],
      name: 'Events',
      areaStyle: { color: 'rgba(99,102,241,0.2)' },
      lineStyle: { color: '#6366f1' },
      itemStyle: { color: '#6366f1' },
    }],
  }],
}})
</script>

<template>
  <BaseChart :option="option" height="220px" />
</template>
