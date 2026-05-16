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
  te:               def('Te-form',           '4A7FCC', ['polarity'],                      ['verb', 'adjective', 'noun']),
  potential:        def('Potential',         'D4923A', ['register', 'tense', 'polarity'], ['verb']),
  volitional:       def('Volitional',        '4E9E5A', ['register'],                      ['verb']),
  conditional:      def('Conditional',       '7C5CBF', ['polarity'],                      ['verb', 'adjective']),
  passive:          def('Passive',           '3B9EA8', ['register', 'tense', 'polarity'], ['verb']),
  causative:        def('Causative',         'C45050', ['register', 'tense', 'polarity'], ['verb']),
  passive_causative: def('Passive-Causative', 'B05C80', ['register', 'tense', 'polarity'], ['verb']),
  imperative:       def('Imperative',        'CC3344', ['polarity'],                     ['verb']),
}
