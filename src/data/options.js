import { FORMS } from './forms.js'

export const WORD_TYPES = [
  { key: 'u-verb',    label: 'う Verbs',        line1: 'う',     line2: 'Verbs' },
  { key: 'ru-verb',   label: 'る Verbs',        line1: 'る',     line2: 'Verbs' },
  { key: 'irregular', label: 'Irregular Verbs', line1: 'Irreg.', line2: 'Verbs' },
  { key: 'i-adj',     label: 'い Adjectives',   line1: 'い',     line2: 'Adj.' },
  { key: 'na-adj',    label: 'な Adjectives',   line1: 'な',     line2: 'Adj.' },
  { key: 'noun',      label: 'Nouns',           line1: 'Nouns',  line2: null },
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
    keyColor:    form.color,
    subtext:     FORM_SUBTEXTS[key] ?? null,
  }))

export const TENSES = [
  { key: 'present', label: 'Present', subtext: '今' },
  { key: 'past',    label: 'Past',    subtext: '先' },
]

export const POLARITIES = [
  { key: 'positive', label: 'Positive', subtext: '+' },
  { key: 'negative', label: 'Negative', subtext: '–' },
]
