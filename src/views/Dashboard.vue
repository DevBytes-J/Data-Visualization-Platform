<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStream } from '@/composables/useStream'
import { useWidgetOrder } from '@/composables/useWidgetOrder'
import { useSoundAlerts } from '@/composables/useSoundAlerts'
import { paletteOpen } from '@/composables/usePalette'
import { useMetricsStore, useNetworkStore, useCryptoStore, useStreamStore } from '@/stores'
import { Terminal, Volume2, VolumeX, GripVertical } from 'lucide-vue-next'

import ConnectionBanner   from '@/components/layout/ConnectionBanner.vue'
import MetricCard         from '@/components/layout/MetricCard.vue'
import DraggableWidget    from '@/components/layout/DraggableWidget.vue'
import ToastContainer     from '@/components/layout/ToastContainer.vue'
import PauseResumeBtn     from '@/components/controls/PauseResumeBtn.vue'
import TimeRangeSelector  from '@/components/controls/TimeRangeSelector.vue'
import ThemeToggle        from '@/components/controls/ThemeToggle.vue'
import CommandPalette     from '@/components/controls/CommandPalette.vue'
import MetricsChart       from '@/components/charts/MetricsChart.vue'
import NetworkChart       from '@/components/charts/NetworkChart.vue'
import CryptoChart        from '@/components/charts/CryptoChart.vue'
import SecurityRadarChart from '@/components/charts/SecurityRadarChart.vue'
import ActivityFeed       from '@/components/feed/ActivityFeed.vue'

const { togglePause, simulateDisconnect } = useStream()
const metrics = useMetricsStore()
const network = useNetworkStore()
const crypto  = useCryptoStore()
const stream  = useStreamStore()
const { muted } = useSoundAlerts()

const cpu   = computed(() => metrics.latest?.cpu.toFixed(1) ?? '--')
const mem   = computed(() => metrics.latest?.memory.toFixed(1) ?? '--')
const disk  = computed(() => metrics.latest?.disk.toFixed(1) ?? '--')
const price = computed(() => crypto.latestPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }))

const kpis = computed(() => [
  { label: 'CPU Usage',           value: cpu.value,   unit: '%', color: 'text-stone-800 dark:text-stone-100' },
  { label: 'Memory',              value: mem.value,   unit: '%', color: 'text-stone-800 dark:text-stone-100' },
  { label: 'Disk',                value: disk.value,  unit: '%', color: 'text-stone-800 dark:text-stone-100' },
  { label: crypto.activeSymbol,   value: price.value, unit: '$', color: 'text-amber-500' },
])

const SYMBOLS = ['BTC', 'ETH', 'SOL'] as const

const WIDGET_IDS = ['metrics', 'network', 'crypto', 'security']
const { order, onDragStart, onDrop } = useWidgetOrder(WIDGET_IDS)
const dragging = ref<string | null>(null)

function handleDragStart(id: string) { dragging.value = id; onDragStart(id) }
function handleDrop(id: string)      { onDrop(id); dragging.value = null }
</script>

<template>
  <ConnectionBanner />
  <ToastContainer />
  <CommandPalette :on-toggle-pause="togglePause" :on-disconnect="simulateDisconnect" />

  <div class="dp-bg min-h-screen text-stone-800 dark:text-stone-200 transition-colors duration-300 flex flex-col">

    <header class="glass fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 lg:px-6 border-b border-black/5 dark:border-white/7 overflow-hidden">
      <div class="flex items-center gap-2 mr-auto">
        <span class="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100">SentinelView</span>
        <span class="live-dot w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" v-if="stream.connected && !stream.paused" />
      </div>

      <div class="flex items-center gap-2">
        <PauseResumeBtn @toggle="togglePause" />
        <button @click="muted = !muted" class="p-2 rounded-lg glass text-stone-400 hover:text-amber-500 transition-colors" :title="muted ? 'Unmute' : 'Mute'">
          <VolumeX v-if="muted" :size="15" /><Volume2 v-else :size="15" />
        </button>
        <button @click="paletteOpen = true" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-stone-400 hover:text-amber-500 transition-colors">
          <Terminal :size="13" /><span>Ctrl+K</span>
        </button>
        <button @click="simulateDisconnect" class="hidden md:block px-3 py-1.5 rounded-lg glass text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
          Disconnect
        </button>
        <ThemeToggle />
      </div>
    </header>

    <div class="flex flex-1 lg:flex-row flex-col min-h-0 pt-[52px]">

    <aside class="glass fixed top-[52px] left-0 bottom-0 lg:w-52 shrink-0 hidden lg:flex flex-col gap-3 py-6 px-5 border-r border-black/5 dark:border-white/7 z-40 overflow-y-auto">
      <div class="hidden lg:flex flex-col gap-3 w-full">
        <div v-for="kpi in kpis" :key="kpi.label" class="flex flex-col gap-0.5">
          <span class="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{{ kpi.label }}</span>
          <span class="text-xl font-black tabular-nums metric-value" :class="kpi.color">
            {{ kpi.value }}<span class="text-xs font-medium ml-0.5 opacity-50">{{ kpi.unit }}</span>
          </span>
        </div>
      </div>
    </aside>

    <main class="flex-1 p-4 lg:p-6 space-y-4 min-w-0 lg:ml-52">

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:hidden">
        <template v-if="stream.loading">
          <div v-for="i in 4" :key="i" class="glass rounded-xl px-4 py-3 h-[72px] animate-pulse bg-stone-200/40 dark:bg-stone-700/20" />
        </template>
        <MetricCard v-else v-for="kpi in kpis" :key="kpi.label" :label="kpi.label" :value="kpi.value" :unit="kpi.unit" :color="kpi.color" />
      </div>

      <template v-for="id in order" :key="id">

        <DraggableWidget v-if="id === 'metrics'" widget-id="metrics" :dragging="dragging === 'metrics'" @dragstart="handleDragStart" @drop="handleDrop">
          <div class="glass rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 class="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <GripVertical :size="14" class="opacity-30 cursor-grab shrink-0" /> System Metrics
              </h2>
              <TimeRangeSelector v-model="metrics.timeRange" />
            </div>
            <MetricsChart />
          </div>
        </DraggableWidget>

        <DraggableWidget v-if="id === 'network'" widget-id="network" :dragging="dragging === 'network'" @dragstart="handleDragStart" @drop="handleDrop">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
            <div class="glass rounded-2xl p-5 min-w-0">
              <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 class="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <GripVertical :size="14" class="opacity-30 cursor-grab shrink-0" /> Network Traffic
                </h2>
                <TimeRangeSelector v-model="network.timeRange" />
              </div>
              <NetworkChart />
            </div>
            <DraggableWidget widget-id="crypto" :dragging="dragging === 'crypto'" @dragstart="handleDragStart" @drop="handleDrop">
              <div class="glass rounded-2xl p-5 h-full">
                <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 class="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <GripVertical :size="14" class="opacity-30 cursor-grab shrink-0" /> Crypto Prices
                  </h2>
                  <div class="flex gap-1">
                    <TimeRangeSelector v-model="crypto.timeRange" />
                    <button
                      v-for="s in SYMBOLS" :key="s"
                      @click="crypto.activeSymbol = s"
                      class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                      :class="crypto.activeSymbol === s ? 'bg-amber-400 text-white' : 'glass text-stone-400 hover:text-amber-500'"
                    >{{ s }}</button>
                  </div>
                </div>
                <CryptoChart />
              </div>
            </DraggableWidget>
          </div>
        </DraggableWidget>

        <DraggableWidget v-if="id === 'security'" widget-id="security" :dragging="dragging === 'security'" @dragstart="handleDragStart" @drop="handleDrop">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
            <div class="glass rounded-2xl p-5 min-w-0">
              <h2 class="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
                <GripVertical :size="14" class="opacity-30 cursor-grab shrink-0" /> Threat Radar
              </h2>
              <SecurityRadarChart />
            </div>
            <div class="glass rounded-2xl lg:col-span-2 overflow-hidden" style="height:340px">
              <div class="px-5 pt-4 pb-2 border-b border-black/5 dark:border-white/7">
                <h2 class="text-sm font-semibold text-stone-500 dark:text-stone-400">Security Events</h2>
              </div>
              <ActivityFeed />
            </div>
          </div>
        </DraggableWidget>

      </template>
    </main>
    </div>
  </div>
</template>
