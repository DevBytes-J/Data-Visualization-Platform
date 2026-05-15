import { ref } from 'vue'

export interface Toast {
  id: string
  severity: 'critical' | 'high'
  type: string
  source: string
}

export const toasts = ref<Toast[]>([])

export function pushToast(t: Omit<Toast, 'id'>) {
  const id = crypto.randomUUID()
  toasts.value.unshift({ ...t, id })
  setTimeout(() => {
    toasts.value = toasts.value.filter(x => x.id !== id)
  }, 5000)
}
