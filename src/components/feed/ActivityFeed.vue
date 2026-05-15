<script setup lang="ts">
import { computed } from 'vue'
import { useSecurityStore } from '@/stores'
import SeverityBadge from './SeverityBadge.vue'

const store = useSecurityStore()
const rows = computed(() => store.filtered.slice(0, 100))
function fmt(ts: number) { return new Date(ts).toLocaleTimeString() }
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-3 border-b border-black/5 dark:border-white/7">
      <input
        v-model="store.filter"
        placeholder="Filter events…"
        class="w-full glass rounded-lg px-3 py-1.5 text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
      />
    </div>
    <div class="overflow-y-auto flex-1 text-xs">
      <table class="w-full">
        <thead class="sticky top-0 z-10 glass">
          <tr class="text-stone-400 text-left">
            <th class="px-3 py-2 font-semibold">Time</th>
            <th class="px-3 py-2 font-semibold">Severity</th>
            <th class="px-3 py-2 font-semibold">Type</th>
            <th class="px-3 py-2 font-semibold hidden sm:table-cell">Source</th>
            <th class="px-3 py-2 font-semibold hidden md:table-cell">Message</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="event in rows" :key="event.id"
            class="border-t border-black/4 dark:border-white/5 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-colors"
          >
            <td class="px-3 py-2 text-stone-400 whitespace-nowrap">{{ fmt(event.ts) }}</td>
            <td class="px-3 py-2"><SeverityBadge :severity="event.severity" /></td>
            <td class="px-3 py-2 whitespace-nowrap">{{ event.type }}</td>
            <td class="px-3 py-2 text-stone-400 hidden sm:table-cell font-mono">{{ event.source }}</td>
            <td class="px-3 py-2 text-stone-400 hidden md:table-cell truncate max-w-xs">{{ event.message }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="rows.length === 0" class="text-center text-stone-400 py-12">No events yet</div>
    </div>
  </div>
</template>
