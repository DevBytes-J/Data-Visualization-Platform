<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
const { isDark, toggle } = useTheme()
</script>

<template>
  <button @click="toggle" class="p-2 rounded-lg glass text-stone-400 hover:text-amber-500 transition-colors" title="Toggle theme">
    <Sun v-if="isDark" :size="16" /><Moon v-else :size="16" />
  </button>
</template>
