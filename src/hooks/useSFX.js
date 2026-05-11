import { useRef } from 'react'

export function useSFX() {
  const audios = useRef({})

  function play(name) {
    if (!audios.current[name]) {
      audios.current[name] = new Audio(`${import.meta.env.BASE_URL}sounds/${name}.mp3`)
    }
    const audio = audios.current[name]
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  return { play }
}
