<script setup lang="ts">
import { Play, Pause } from 'lucide-vue-next'
import { useStreamStore } from '@/stores'

const emit = defineEmits<{ toggle: [] }>()
const store = useStreamStore()
</script>

<template>
  <button
    @click="emit('toggle')"
    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs font-semibold transition-colors"
    :class="store.paused ? 'text-amber-500 hover:text-amber-600' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'"
  >
    <span v-if="!store.paused" class="live-dot w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
    <Play v-if="store.paused" :size="12" />
    <Pause v-else :size="12" />
    <span>{{ store.paused ? 'Resume' : 'Pause' }}</span>
  </button>
</template>
