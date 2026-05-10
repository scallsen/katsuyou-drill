import { getAllWords } from './wordStore.js'
import { FORMS } from './forms.js'
import { CATEGORIES } from './categories.js'

// Builds a flat array of card specs from the current option selections.
// Each spec is one (word × form × subKey) combo that has a valid conjugation.
export function buildPool({ selectedWordTypes, selectedForms, selectedRegisters, selectedTenses, selectedPolarities }) {
  const words = filterWords(selectedWordTypes)
  if (!words.length) return []

  const forms = selectedForms.length ? selectedForms : ['default']
  const cards = []

  for (const formKey of forms) {
    const form = FORMS[formKey]
    if (!form) continue
    const { axes } = form

    const regs  = axes.includes('register')  ? selectedRegisters  : [null]
    const tens  = axes.includes('tense')     ? selectedTenses     : [null]
    const pols  = axes.includes('polarity')  ? selectedPolarities : [null]

    for (const register of regs) {
      for (const tense of tens) {
        for (const polarity of pols) {
          const subKey = buildSubKey(formKey, { register, tense, polarity })
          if (!subKey) continue

          for (const word of words) {
            const conjugation = getConjugation(word, formKey, subKey)
            if (!conjugation) continue
            cards.push({
              id: `${word.id}__${formKey}__${subKey}`,
              word,
              formKey,
              subKey,
              register,
              tense,
              polarity,
              conjugation,
              variant: resolveVariant(formKey, register),
              bgColor: form.color ?? null,
            })
          }
        }
      }
    }
  }

  return cards
}

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
