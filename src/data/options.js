import { FORMS } from './forms.js'

export const WORD_TYPES = [
  { key: 'u-verb',    label: 'う Verbs' },
  { key: 'ru-verb',   label: 'る Verbs' },
  { key: 'irregular', label: 'Irregular Verbs' },
  { key: 'i-adj',     label: 'い Adjectives' },
  { key: 'na-adj',    label: 'な Adjectives' },
  { key: 'noun',      label: 'Nouns' },
]

export const REGISTERS = [
  { key: 'plain',  subtext: '〜う・る' },
  { key: 'polite', subtext: '〜ます' },
]

export const REGISTER_KEYS = REGISTERS.map(r => r.key)

const FORM_SUBTEXTS = {
  te:               '〜て',
  potential:        '〜られる',
  volitional:       '〜よう',
  conditional:      '〜えば',
  passive:          '〜られる',
  causative:        '〜させる',
  passive_causative: '〜させられる',
  imperative:       '〜え',
}

export const GRAMMAR_FORMS = Object.entries(FORMS)
  .filter(([key]) => !REGISTER_KEYS.includes(key))
  .map(([key, form]) => ({
    key,
    label:       form.label,
    bgColor:     form.bgColor,
    keyColor:    form.color,
    subtext:     FORM_SUBTEXTS[key] ?? null,
  }))

export const TENSES = [
  { key: 'present', label: 'Present' },
  { key: 'past',    label: 'Past' },
]

export const POLARITIES = [
  { key: 'positive', label: 'Positive' },
  { key: 'negative', label: 'Negative' },
]
