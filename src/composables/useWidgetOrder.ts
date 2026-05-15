import { ref } from 'vue'

export interface Widget {
  id: string
  order: number
}

const STORAGE_KEY = 'sentinelview-widget-order'

export function useWidgetOrder(ids: string[]) {
  const order = ref<string[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? ids
  )

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order.value))
  }

  let dragSrc: string | null = null

  function onDragStart(id: string) { dragSrc = id }

  function onDrop(targetId: string) {
    if (!dragSrc || dragSrc === targetId) return
    const arr = [...order.value]
    const from = arr.indexOf(dragSrc)
    const to   = arr.indexOf(targetId)
    arr.splice(from, 1)
    arr.splice(to, 0, dragSrc)
    order.value = arr
    save()
    dragSrc = null
  }

  return { order, onDragStart, onDrop }
}
