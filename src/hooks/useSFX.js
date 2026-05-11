import { useRef } from 'react'

function getCtx(ctxRef) {
  if (!ctxRef.current) ctxRef.current = new AudioContext()
  if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
  return ctxRef.current
}

function tone(ctx, { freq, freqEnd, vol, type = 'triangle', duration, offset = 0 }) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  const t = ctx.currentTime + offset
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.start(t)
  osc.stop(t + duration + 0.01)
}

export function useSFX() {
  const ctxRef = useRef(null)

  function play(name) {
    const ctx = getCtx(ctxRef)
    if (name === 'flip_card') {
      tone(ctx, { freq: 1000, freqEnd: 500, vol: 0.15, duration: 0.1 })
    } else if (name === 'draw_card') {
      tone(ctx, { freq: 900, freqEnd: 300, vol: 0.12, duration: 0.1, offset: 0 })
      tone(ctx, { freq: 400, freqEnd: 900, vol: 0.15, duration: 0.1, offset: 0.14 })
    } else if (name === 'flip_card_correct') {
      tone(ctx, { freq: 350, freqEnd: 600, vol: 0.18, type: 'sine', duration: 0.1, offset: 0 })
      tone(ctx, { freq: 600, freqEnd: 1100, vol: 0.18, type: 'sine', duration: 0.12, offset: 0.12 })
    } else if (name === 'flip_card_wrong') {
      tone(ctx, { freq: 300, freqEnd: 550, vol: 0.20, type: 'sawtooth', duration: 0.07, offset: 0 })
      tone(ctx, { freq: 550, freqEnd: 180, vol: 0.20, type: 'sawtooth', duration: 0.20, offset: 0.07 })
    }
  }

  return { play }
}
