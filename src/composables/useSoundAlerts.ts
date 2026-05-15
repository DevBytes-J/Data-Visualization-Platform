import { ref } from 'vue'

const muted = ref(false)
let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function beep(freq: number, duration: number, gain: number) {
  if (muted.value) return
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g   = ac.createGain()
  osc.connect(g)
  g.connect(ac.destination)
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

export function useSoundAlerts() {
  function alertCritical() { beep(880, 0.3, 0.4); setTimeout(() => beep(880, 0.3, 0.4), 350) }
  function alertHigh()     { beep(660, 0.25, 0.25) }

  return { muted, alertCritical, alertHigh }
}
