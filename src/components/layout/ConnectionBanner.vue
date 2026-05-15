<script setup lang="ts">
import { useStreamStore } from '@/stores'
import { WifiOff } from 'lucide-vue-next'
const store = useStreamStore()
</script>

<template>
  <Transition name="slide">
    <div
      v-if="!store.connected"
      class="fixed top-0 left-0 right-0 z-50 bg-rose-500/90 backdrop-blur text-white text-sm text-center py-2 font-semibold flex items-center justify-center gap-2"
    >
      <WifiOff :size="14" />
      Stream disconnected — reconnecting…
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateY(-100%); }
</style>
