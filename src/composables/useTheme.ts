import { ref } from 'vue'

const STORAGE_KEY = 'sentinelview-theme'

function initDark(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) return saved === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(initDark())
document.documentElement.classList.toggle('dark', isDark.value)

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  }
  return { isDark, toggle }
}
