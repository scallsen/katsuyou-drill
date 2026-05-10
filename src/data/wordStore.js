import builtinWords from './words.json'

// Merges custom words from localStorage with builtin words.
// Custom words with the same id as a builtin entry override it.
function loadWords() {
  try {
    const raw = localStorage.getItem('customWords')
    if (!raw) return builtinWords
    const custom = JSON.parse(raw)
    const customMap = Object.fromEntries(custom.map(w => [w.id, w]))
    return builtinWords.map(w => customMap[w.id] ?? w).concat(
      custom.filter(w => !builtinWords.some(b => b.id === w.id))
    )
  } catch {
    return builtinWords
  }
}

export function getAllWords() {
  return loadWords()
}

export function getWordMap() {
  return Object.fromEntries(loadWords().map(w => [w.id, w]))
}
