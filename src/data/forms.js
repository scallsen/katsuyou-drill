function lightenHex(hex, amount = 0.85) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `#${[r, g, b].map(c => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')).join('')}`
}

function def(label, hex, axes, validWordTypes, icon = null) {
  return { label, color: `#${hex}`, bgColor: lightenHex(hex), icon, axes, validWordTypes }
}

// Single source of truth for all form and register definitions.
// axes: which drill dimensions apply to this form ('register', 'tense', 'polarity')
// validWordTypes: which word types this form is valid for
export const FORMS = {
  // ── Registers ─────────────────────────────────────────────────────
  plain:            def('Plain',             'C8B89A', ['tense', 'polarity'],            ['verb', 'adjective']),
  polite:           def('Polite',            'D0D0D0', ['tense', 'polarity'],            ['verb']),

  // ── Verb / word forms ──────────────────────────────────────────────
  default:          def('Default',           '888888', ['register', 'tense', 'polarity'], ['verb', 'adjective', 'noun']),
  te:               def('Te-form',           'FF8C18', ['polarity'],                      ['verb', 'adjective', 'noun']),
  potential:        def('Potential',         'FFCC00', ['register', 'tense', 'polarity'], ['verb']),
  volitional:       def('Volitional',        '5EFF74', ['register'],                      ['verb']),
  conditional:      def('Conditional',       '468CFD', ['polarity'],                      ['verb', 'adjective']),
  passive:          def('Passive',           'CE6CFB', ['register', 'tense', 'polarity'], ['verb']),
  causative:        def('Causative',         'FF5858', ['register', 'tense', 'polarity'], ['verb']),
  passive_causative: def('Passive-Causative', 'FF5895', ['register', 'tense', 'polarity'], ['verb']),
  imperative:       def('Imperative',        'FF4E18', ['polarity'],                     ['verb']),
  adverbial:        def('Adverbial',         'A0C4FF', ['polarity'],                     ['adjective']),
}
