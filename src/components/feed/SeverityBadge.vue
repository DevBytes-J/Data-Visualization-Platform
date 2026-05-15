<script setup lang="ts">
import type { Severity } from '@/types'

const COLOR: Record<Severity, string> = {
  critical: 'bg-red-500/15 text-red-500 border-red-500/20',
  high:     'bg-orange-500/15 text-orange-500 border-orange-500/20',
  medium:   'bg-amber-500/15 text-amber-600 border-amber-500/20',
  low:      'bg-stone-500/15 text-stone-500 border-stone-500/20',
  info:     'bg-stone-400/10 text-stone-400 border-stone-400/20',
}
defineProps<{ severity: Severity }>()
</script>

<template>
  <span class="px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide" :class="COLOR[severity]">
    {{ severity }}
  </span>
</template>
