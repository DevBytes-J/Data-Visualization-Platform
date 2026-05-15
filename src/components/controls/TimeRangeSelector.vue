<script setup lang="ts">
import type { TimeRange } from '@/types'

const props = defineProps<{ modelValue: TimeRange }>()
const emit = defineEmits<{ 'update:modelValue': [v: TimeRange] }>()
const ranges: TimeRange[] = ['1m', '5m', '15m', '1h', 'live']
</script>

<template>
  <div class="flex gap-1">
    <button
      v-for="r in ranges" :key="r"
      @click="emit('update:modelValue', r)"
      class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
      :class="props.modelValue === r
        ? 'bg-amber-400 text-white'
        : 'glass text-stone-400 hover:text-amber-500'"
    >{{ r.toUpperCase() }}</button>
  </div>
</template>
