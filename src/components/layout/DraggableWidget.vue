<script setup lang="ts">
defineProps<{ widgetId: string; dragging?: boolean }>()
const emit = defineEmits<{
  dragstart: [id: string]
  drop: [id: string]
}>()
</script>

<template>
  <div
    class="transition-opacity"
    :class="dragging ? 'opacity-50' : 'opacity-100'"
    @dragover.prevent
    @drop.prevent="emit('drop', widgetId)"
  >
    <div
      draggable="true"
      class="contents"
      @dragstart="emit('dragstart', widgetId)"
    >
      <slot />
    </div>
  </div>
</template>
