import { PlainBg } from './backgrounds/index.js'
import VARIANT_COLORS from './variantColors.js'

function lightenHex(hex, amount = 0.85) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `#${[r, g, b].map(c => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')).join('')}`
}

function makeVariant(label, colorKey, BgComponent = null) {
  const hex = VARIANT_COLORS[colorKey]
  return {
    label,
    keyColor: `#${hex}`,
    bgColor: lightenHex(hex),
    border: `2px solid #${hex}`,
    BgComponent,
  }
}

const VARIANTS = {
  plain:            makeVariant('Plain', 'plain', PlainBg),
  polite:           makeVariant('Polite', 'polite'),
  te:               makeVariant('Te-form', 'te'),
  potential:        makeVariant('Potential', 'potential'),
  volitional:       makeVariant('Volitional', 'volitional'),
  conditional:      makeVariant('Conditional', 'conditional'),
  passive:          makeVariant('Passive', 'passive'),
  causative:        makeVariant('Causative', 'causative'),
  passiveCausative: makeVariant('Passive-Causative', 'passiveCausative'),
  imperative:       makeVariant('Imperative', 'imperative'),
}

export default VARIANTS
