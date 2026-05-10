const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

export function useTTS() {
  function speak(text) {
    if (!supported) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.85
    speechSynthesis.speak(utterance)
  }

  function cancel() {
    if (!supported) return
    speechSynthesis.cancel()
  }

  return { speak, cancel }
}
