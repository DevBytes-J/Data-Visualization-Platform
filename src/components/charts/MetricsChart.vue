<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMetricsStore } from '@/stores'
import { useThrottle } from '@/composables/useThrottle'
import BaseChart from './BaseChart.vue'
import type { EChartsOption } from 'echarts'

const store = useMetricsStore()
const data  = useThrottle(computed(() => store.visible), 400)
const chartType = ref<'area' | 'line'>('area')

const SERIES = [
  { name: 'CPU %',    key: 'cpu'    as const, color: '#6366f1', opacity: 0.15 },
  { name: 'Memory %', key: 'memory' as const, color: '#22d3ee', opacity: 0.10 },
  { name: 'Disk %',   key: 'disk'   as const, color: '#f59e0b', opacity: 0.08 },
]

const option = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  animation: true,
  animationDuration: 200,
  grid: { top: 36, right: 16, bottom: 56, left: 50 },
  tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
  legend: { data: SERIES.map(s => s.name), textStyle: { color: '#94a3b8' }, top: 4, selectedMode: true },
  dataZoom: [{ type: 'inside', start: 0, end: 100 }],
  xAxis: {
    type: 'category',
    data: data.value.map(p => new Date(p.ts).toLocaleTimeString()),
    axisLabel: { color: '#64748b', fontSize: 10 },
    axisLine: { lineStyle: { color: '#334155' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value', min: 0, max: 100,
    axisLabel: { color: '#64748b', fontSize: 10, formatter: '{value}%' },
    splitLine: { lineStyle: { color: '#1e293b' } },
  },
  series: SERIES.map(s => ({
    name: s.name, type: 'line', smooth: true, symbol: 'none',
    data: data.value.map(p => p[s.key].toFixed(1)),
    areaStyle: chartType.value === 'area' ? { opacity: s.opacity } : undefined,
    lineStyle: { color: s.color, width: 2 },
    itemStyle: { color: s.color },
  })),
}))
</script>

<template>
  <div>
    <div class="flex gap-1 mb-3">
      <button
        v-for="t in (['area', 'line'] as const)" :key="t"
        @click="chartType = t"
        class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all capitalize"
        :class="chartType === t ? 'bg-amber-400 text-white' : 'glass text-stone-400 hover:text-amber-500'"
      >{{ t }}</button>
    </div>
    <div v-if="data.length === 0" class="flex items-center justify-center h-[240px] text-stone-400 text-sm">
      Waiting for data…
    </div>
    <BaseChart v-else :option="option" height="240px" />
  </div>
</template>
