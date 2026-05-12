const KANJI_RE = /[一-鿿㐀-䶿]/

function isKanji(ch) {
  return KANJI_RE.test(ch)
}

// Returns { kanjiPart, furigana, okurigana } or null if no leading kanji found.
// Assumes the common verb pattern: [kanji block][okurigana kana].
export function buildFurigana(kanjiStr, kanaStr) {
  let kanjiLen = 0
  while (kanjiLen < kanjiStr.length && isKanji(kanjiStr[kanjiLen])) kanjiLen++
  if (kanjiLen === 0) return null

  const kanjiPart = kanjiStr.slice(0, kanjiLen)
  const okurigana = kanjiStr.slice(kanjiLen)
  const furigana  = kanaStr.slice(0, kanaStr.length - okurigana.length)
  if (!furigana) return null

  return { kanjiPart, furigana, okurigana }
}

// 来る stem alternation: okurigana first-char → correct reading of 来
const KURU_READINGS = { る: 'く', れ: 'く', た: 'き', て: 'き', ま: 'き', な: 'こ', よ: 'こ', ら: 'こ', さ: 'こ', い: 'こ' }

export function buildFuriganaForConjugation(conjugation, wordKanji, wordKana) {
  const base = buildFurigana(wordKanji, wordKana)
  if (!base) return null
  if (!conjugation.startsWith(base.kanjiPart)) return null
  const okurigana = conjugation.slice(base.kanjiPart.length)
  const furigana = base.kanjiPart === '来' ? (KURU_READINGS[okurigana[0]] ?? base.furigana) : base.furigana
  return { kanjiPart: base.kanjiPart, furigana, okurigana }
}
