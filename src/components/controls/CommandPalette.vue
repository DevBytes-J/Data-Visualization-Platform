<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMetricsStore, useNetworkStore, useCryptoStore, useStreamStore } from '@/stores'
import { useTheme } from '@/composables/useTheme'
import { paletteOpen as open } from '@/composables/usePalette'
import { Radio, WifiOff, Clock, TrendingUp, Sun } from 'lucide-vue-next'
import type { TimeRange } from '@/types'
import type { Component } from 'vue'

const props = defineProps<{ onTogglePause: () => void; onDisconnect: () => void }>()
const query = ref('')

const metrics = useMetricsStore()
const network = useNetworkStore()
const crypto  = useCryptoStore()
const stream  = useStreamStore()
const { toggle: toggleTheme } = useTheme()

interface Command { id: string; label: string; icon: Component; action: () => void }

const commands = computed<Command[]>(() => [
  { id: 'pause',      label: stream.paused ? 'Resume Stream' : 'Pause Stream', icon: Radio,    action: props.onTogglePause },
  { id: 'disconnect', label: 'Simulate Disconnect',                             icon: WifiOff,  action: props.onDisconnect },
  ...(['1m','5m','15m','1h','live'] as TimeRange[]).map(r => ({
    id: `range-${r}`, label: `Set Time Range: ${r.toUpperCase()}`, icon: Clock,
    action: () => { metrics.timeRange = r; network.timeRange = r; crypto.timeRange = r },
  })),
  ...(['BTC','ETH','SOL'] as const).map(s => ({
    id: `sym-${s}`, label: `Switch to ${s}`, icon: TrendingUp,
    action: () => { crypto.activeSymbol = s },
  })),
  { id: 'dark', label: 'Toggle Dark / Light Mode', icon: Sun, action: toggleTheme },
])

const filtered = computed(() =>
  query.value
    ? commands.value.filter(c => c.label.toLowerCase().includes(query.value.toLowerCase()))
    : commands.value
)

const selected = ref(0)

function run(cmd: Command) {
  cmd.action()
  close()
}

function close() { open.value = false; query.value = ''; selected.value = 0 }

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open.value = !open.value }
  if (!open.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowDown') { e.preventDefault(); selected.value = Math.min(selected.value + 1, filtered.value.length - 1) }
  if (e.key === 'ArrowUp')   { e.preventDefault(); selected.value = Math.max(selected.value - 1, 0) }
  if (e.key === 'Enter' && filtered.value[selected.value]) run(filtered.value[selected.value])
}


onMounted(()  => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" @click.self="close">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />
        <div class="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <input
            ref="inputEl"
            v-model="query"
            autofocus
            placeholder="Type a command..."
            class="w-full bg-transparent px-4 py-3.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-b border-gray-200 dark:border-gray-800 focus:outline-none"
            @input="selected = 0"
          />
          <ul class="max-h-72 overflow-y-auto py-1">
            <li
              v-for="(cmd, i) in filtered"
              :key="cmd.id"
              @click="run(cmd)"
              @mousemove="selected = i"
              class="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors"
              :class="i === selected ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              <span class="text-gray-400 shrink-0"><component :is="cmd.icon" :size="14" /></span>
              <span>{{ cmd.label }}</span>
            </li>
            <li v-if="filtered.length === 0" class="px-4 py-3 text-sm text-gray-400">No commands found</li>
          </ul>
          <span class="px-3 py-2 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-600 flex gap-4">
            <span>up/down navigate</span><span>enter run</span><span>esc close</span>
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
