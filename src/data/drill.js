import { getAllWords } from './wordStore.js'
import { FORMS } from './forms.js'
import { CATEGORIES } from './categories.js'

// Returns all words whose wordType+group matches any of the selected category keys.
export function filterWords(selectedWordTypeKeys) {
  if (!selectedWordTypeKeys.length) return []
  const words = getAllWords()
  return words.filter(word =>
    selectedWordTypeKeys.some(key => {
      const cat = CATEGORIES.find(c => c.key === key)
      return cat && word.wordType === cat.wordType && word.group === cat.group
    })
  )
}

// Builds the sub-key used to look up a conjugation within word.forms[formKey].
// Joins only the axes that apply to the form, in order: register, tense, polarity.
// Returns null if a required axis has no value supplied.
export function buildSubKey(formKey, { register, tense, polarity } = {}) {
  const axes = FORMS[formKey]?.axes ?? []
  const parts = []
  for (const axis of axes) {
    if (axis === 'register') {
      if (!register) return null
      parts.push(register)
    } else if (axis === 'tense') {
      if (!tense) return null
      parts.push(tense)
    } else if (axis === 'polarity') {
      if (!polarity) return null
      parts.push(polarity)
    }
  }
  return parts.join('_') || null
}

// Looks up a specific conjugation string from a word entry.
// Returns null if the form or sub-key doesn't exist on the word.
export function getConjugation(word, formKey, subKey) {
  if (!word || !formKey || !subKey) return null
  return word.forms?.[formKey]?.[subKey] ?? null
}

// Returns the card variant key to use for a given form + register selection.
// 'default' form uses the register colour; all other forms use their own colour.
export function resolveVariant(formKey, register) {
  if (!formKey || formKey === 'default') return register ?? 'plain'
  return formKey
}
