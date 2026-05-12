import { getAllWords } from './wordStore.js'
import { FORMS } from './forms.js'
import { CATEGORIES } from './categories.js'
import { isIllegal } from './illegalCombos.js'
import { conjugate } from './conjugation.js'

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
          for (const word of words) {
            const answers = conjugate(word, formKey, register, tense, polarity)
            if (!answers) continue
            const subKey = [formKey, register, tense, polarity].filter(Boolean).join('_')
            const spec = {
              id: `${word.id}__${formKey}__${subKey}`,
              word,
              formKey,
              subKey,
              register,
              tense,
              polarity,
              conjugation: answers[0],
              acceptedAnswers: answers,
              variant: resolveVariant(formKey, register),
              bgColor: form.color ?? null,
            }
            if (!isIllegal(spec)) cards.push(spec)
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

// Returns the card variant key to use for a given form + register selection.
// 'default' form uses the register colour; all other forms use their own colour.
export function resolveVariant(formKey, register) {
  if (!formKey || formKey === 'default') return register ?? 'plain'
  return formKey
}
