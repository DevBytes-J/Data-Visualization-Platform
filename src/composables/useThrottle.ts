import { ref, watch, type Ref } from 'vue'

export function useThrottle<T>(source: Ref<T>, ms = 500): Ref<T> {
  const throttled = ref(source.value) as Ref<T>
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (val) => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      throttled.value = val
    } else {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        last = Date.now()
        throttled.value = source.value
      }, ms - (now - last))
    }
  }, { deep: true })

  return throttled
}
