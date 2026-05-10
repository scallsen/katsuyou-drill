// Cards that should never appear in the drill because the answer is trivial or
// identical to information already shown on the card front.
//
// Each rule is a partial card-spec object. A card is illegal if ALL of a rule's
// key/value pairs match the card's corresponding fields.
export const ILLEGAL_COMBOS = [
  // Plain non-past positive on the Default form = dictionary form = same as the
  // word shown on the card front.
  { formKey: 'default', register: 'plain', tense: 'nonPast', polarity: 'positive' },
]

export function isIllegal(card) {
  return ILLEGAL_COMBOS.some(rule =>
    Object.entries(rule).every(([k, v]) => card[k] === v)
  )
}
