import { lightenHex } from '../utils/color.js'

function def(label, hex, axes, validWordTypes, icon = null, backColor = null) {
  return { label, color: `#${hex}`, bgColor: lightenHex(hex), backColor, icon, axes, validWordTypes }
}

// Single source of truth for all form and register definitions.
// axes: which drill dimensions apply to this form ('register', 'tense', 'polarity')
// validWordTypes: which word types this form is valid for
export const FORMS = {
  // ── Registers ─────────────────────────────────────────────────────
  plain:            def('Plain',             'D0D0D0', ['tense', 'polarity'],            ['verb', 'adjective'],   null, '#4C4C4C'),
  polite:           def('Polite',            'D0D0D0', ['tense', 'polarity'],            ['verb'],                null, '#4C4C4C'),

  // ── Verb / word forms ──────────────────────────────────────────────
  default:          def('Default',           '888888', ['register', 'tense', 'polarity'], ['verb', 'adjective', 'noun']),
  te:               def('Te-form',           '3A7FEF', ['polarity'],                      ['verb', 'adjective', 'noun']),
  potential:        def('Potential',         'E8962E', ['register', 'tense', 'polarity'], ['verb']),
  volitional:       def('Volitional',        '3CC25E', ['register'],                      ['verb']),
  conditional:      def('Conditional',       '8A55E0', ['polarity'],                      ['verb', 'adjective']),
  passive:          def('Passive',           '25B4C4', ['register', 'tense', 'polarity'], ['verb']),
  causative:        def('Causative',         'D83C3C', ['register', 'tense', 'polarity'], ['verb']),
  passive_causative: def('Passive-Causative', 'CC4888', ['register', 'tense', 'polarity'], ['verb']),
  imperative:       def('Imperative',        'E02040', ['polarity'],                     ['verb']),
}
