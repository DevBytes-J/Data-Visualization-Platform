<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ label: string; value: string | number; unit?: string; color?: string }>()

const displayed = ref(props.value)
let raf = 0

watch(() => props.value, (next) => {
  const target = parseFloat(String(next))
  if (isNaN(target)) { displayed.value = next; return }

  const start = parseFloat(String(displayed.value)) || 0
  const delta = target - start
  const dur   = 300
  const t0    = performance.now()

  cancelAnimationFrame(raf)
  function step(now: number) {
    const p = Math.min((now - t0) / dur, 1)
    displayed.value = (start + delta * p).toFixed(1)
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
})
</script>

<template>
  <div class="glass rounded-xl px-4 py-3 flex flex-col gap-0.5">
    <span class="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{{ label }}</span>
    <div class="flex items-end gap-1">
      <span class="text-2xl font-black tabular-nums" :class="color ?? 'text-stone-800 dark:text-stone-100'">{{ displayed }}</span>
      <span v-if="unit" class="text-xs font-medium opacity-40 mb-0.5">{{ unit }}</span>
    </div>
  </div>
</template>
