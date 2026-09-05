/** A clock that ticks so posted labels stay current while the page is open. */
export function useNow(intervalMs = 60_000) {
  const now = ref(new Date())

  onMounted(() => {
    const tick = () => {
      now.value = new Date()
    }
    const id = window.setInterval(tick, intervalMs)
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    onUnmounted(() => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    })
  })

  return now
}
