<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, CandlestickChart, RadarChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  DataZoomComponent, MarkLineComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer, LineChart, BarChart, CandlestickChart, RadarChart,
  GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent,
])

defineProps<{ option: EChartsOption; height?: string }>()
</script>

<template>
  <VChart
    :option="option"
    :style="{ height: height ?? '260px', width: '100%' }"
    autoresize
    :update-options="{ notMerge: false, lazyUpdate: true }"
  />
</template>
