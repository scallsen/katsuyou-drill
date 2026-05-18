import { FORMS } from '../../data/forms.js'
import { PlainBg, GraphBg } from './backgrounds/index.js'

const BG_COMPONENTS = { plain: PlainBg, te: GraphBg, conditional: GraphBg, adverbial: GraphBg }

const VARIANT_KEYS = ['plain', 'polite', 'te', 'potential', 'volitional', 'conditional', 'passive', 'causative', 'passive_causative', 'imperative', 'adverbial']

const NEUTRAL_FORMS = new Set(['plain', 'polite'])

const VARIANTS = Object.fromEntries(
  VARIANT_KEYS.map(key => [key, {
    label:       FORMS[key].label,
    keyColor:    FORMS[key].color,
    bgColor:     NEUTRAL_FORMS.has(key) ? FORMS[key].bgColor : '#FFFFFF',
    border:      `5px solid ${FORMS[key].color}`,
    BgComponent: BG_COMPONENTS[key] ?? null,
  }])
)

export default VARIANTS
