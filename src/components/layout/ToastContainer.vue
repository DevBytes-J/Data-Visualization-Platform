<script setup lang="ts">
import { toasts } from '@/composables/useToasts'
import { ShieldAlert, AlertTriangle, X } from 'lucide-vue-next'

function dismiss(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" style="max-width:320px">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-xl border text-sm"
          :class="t.severity === 'critical'
            ? 'bg-red-950/90 border-red-500/30 text-red-100'
            : 'bg-orange-950/90 border-orange-500/30 text-orange-100'"
        >
          <ShieldAlert v-if="t.severity === 'critical'" :size="16" class="shrink-0 mt-0.5 text-red-400" />
          <AlertTriangle v-else :size="16" class="shrink-0 mt-0.5 text-orange-400" />
          <div class="flex-1 min-w-0">
            <div class="font-semibold uppercase text-[10px] tracking-widest opacity-60 mb-0.5">{{ t.severity }}</div>
            <div class="font-medium truncate">{{ t.type }}</div>
            <div class="text-xs opacity-50 font-mono mt-0.5">{{ t.source }}</div>
          </div>
          <button @click="dismiss(t.id)" class="opacity-40 hover:opacity-80 transition-opacity shrink-0">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(100%); }
.toast-leave-to     { opacity: 0; transform: translateX(100%); }
</style>
