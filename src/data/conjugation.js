// Godan verb stem row transformations keyed by the final kana character.
const GODAN = {
  'う': { a: 'わ', i: 'い', e: 'え', o: 'お', te: 'って', ta: 'った' },
  'く': { a: 'か', i: 'き', e: 'け', o: 'こ', te: 'いて', ta: 'いた' },
  'ぐ': { a: 'が', i: 'ぎ', e: 'げ', o: 'ご', te: 'いで', ta: 'いだ' },
  'す': { a: 'さ', i: 'し', e: 'せ', o: 'そ', te: 'して', ta: 'した' },
  'つ': { a: 'た', i: 'ち', e: 'て', o: 'と', te: 'って', ta: 'った' },
  'ぬ': { a: 'な', i: 'に', e: 'ね', o: 'の', te: 'んで', ta: 'んだ' },
  'ぶ': { a: 'ば', i: 'び', e: 'べ', o: 'ぼ', te: 'んで', ta: 'んだ' },
  'む': { a: 'ま', i: 'み', e: 'め', o: 'も', te: 'んで', ta: 'んだ' },
  'る': { a: 'ら', i: 'り', e: 'れ', o: 'ろ', te: 'って', ta: 'った' },
}

// Suffix table for ichidan-style tense/polarity/register conjugation.
// Used for the stem of derived forms (potential, passive, causative, etc.)
const TENSE_SUFFIX = {
  plain: {
    present: { positive: 'る',           negative: 'ない'         },
    past:    { positive: 'た',           negative: 'なかった'     },
  },
  polite: {
    present: { positive: 'ます',         negative: 'ません'       },
    past:    { positive: 'ました',       negative: 'ませんでした' },
  },
}

// Returns [kanji, kana] accepted forms, deduplicating when they are identical.
function buildPairs(kanji, kana) {
  return kanji === kana ? [kanji] : [kanji, kana]
}

// Conjugates a bare ichidan stem (without the final る) for all tense/polarity/register combos.
// Used by all derived forms that produce ichidan verbs (potential, passive, causative, etc.).
function ichidanTensed(kStem, nStem, register, tense, polarity) {
  const suffix = TENSE_SUFFIX[register]?.[tense]?.[polarity]
  if (!suffix) return null
  return buildPairs(kStem + suffix, nStem + suffix)
}

function conjugateGodan(word, formKey, register, tense, polarity) {
  const kana = word.kana
  const ending = kana.slice(-1)
  const row = GODAN[ending]
  if (!row) return null

  const kBase = word.kanji.slice(0, -1)
  const nBase = kana.slice(0, -1)

  // 行く has a contracted te/ta despite ending in く (行いて would be wrong)
  const te = kana === 'いく' ? 'って' : row.te
  const ta = kana === 'いく' ? 'った' : row.ta

  if (kana === 'ある' && formKey === 'potential') return null

  switch (formKey) {
    case 'default': {
      if (register === 'plain') {
        if (tense === 'present' && polarity === 'positive') return buildPairs(word.kanji, kana)
        if (tense === 'present' && polarity === 'negative') return buildPairs(kBase + row.a + 'ない',     nBase + row.a + 'ない')
        if (tense === 'past'    && polarity === 'positive') return buildPairs(kBase + ta,                 nBase + ta)
        if (tense === 'past'    && polarity === 'negative') return buildPairs(kBase + row.a + 'なかった', nBase + row.a + 'なかった')
      }
      if (register === 'polite') {
        return ichidanTensed(kBase + row.i, nBase + row.i, 'polite', tense, polarity)
      }
      return null
    }

    case 'te': {
      if (polarity === 'positive') return buildPairs(kBase + te,               nBase + te)
      if (polarity === 'negative') return buildPairs(kBase + row.a + 'ないで', nBase + row.a + 'ないで')
      return null
    }

    case 'conditional': {
      if (polarity === 'positive') return buildPairs(kBase + row.e + 'ば',        nBase + row.e + 'ば')
      if (polarity === 'negative') return buildPairs(kBase + row.a + 'なければ', nBase + row.a + 'なければ')
      return null
    }

    case 'volitional': {
      if (register === 'plain')  return buildPairs(kBase + row.o + 'う',    nBase + row.o + 'う')
      if (register === 'polite') return buildPairs(kBase + row.i + 'ましょう', nBase + row.i + 'ましょう')
      return null
    }

    case 'potential':
      return ichidanTensed(kBase + row.e, nBase + row.e, register, tense, polarity)

    case 'passive':
      return ichidanTensed(kBase + row.a + 'れ', nBase + row.a + 'れ', register, tense, polarity)

    case 'causative':
      return ichidanTensed(kBase + row.a + 'せ', nBase + row.a + 'せ', register, tense, polarity)

    case 'passive_causative': {
      const contracted = ichidanTensed(kBase + row.a + 'され',   nBase + row.a + 'され',   register, tense, polarity)
      const full       = ichidanTensed(kBase + row.a + 'せられ', nBase + row.a + 'せられ', register, tense, polarity)
      if (!contracted || !full) return null
      return [...new Set([...contracted, ...full])]
    }

    case 'imperative': {
      if (polarity === 'positive') return buildPairs(kBase + row.e, nBase + row.e)
      if (polarity === 'negative') return buildPairs(word.kanji + 'な', kana + 'な')
      return null
    }

    default:
      return null
  }
}

function conjugateIchidan(word, formKey, register, tense, polarity) {
  const kana = word.kana
  const kS = word.kanji.slice(0, -1)
  const nS = kana.slice(0, -1)

  switch (formKey) {
    case 'default':
      return ichidanTensed(kS, nS, register, tense, polarity)

    case 'te': {
      if (polarity === 'positive') return buildPairs(kS + 'て',      nS + 'て')
      if (polarity === 'negative') return buildPairs(kS + 'ないで',  nS + 'ないで')
      return null
    }

    case 'conditional': {
      if (polarity === 'positive') return buildPairs(kS + 'れば',      nS + 'れば')
      if (polarity === 'negative') return buildPairs(kS + 'なければ',  nS + 'なければ')
      return null
    }

    case 'volitional': {
      if (register === 'plain')  return buildPairs(kS + 'よう',    nS + 'よう')
      if (register === 'polite') return buildPairs(kS + 'ましょう', nS + 'ましょう')
      return null
    }

    case 'potential': {
      const standard = ichidanTensed(kS + 'られ', nS + 'られ', register, tense, polarity)
      const ranuki   = ichidanTensed(kS + 'れ',   nS + 'れ',   register, tense, polarity)
      if (!standard) return null
      return [...new Set([...standard, ...(ranuki || [])])]
    }

    case 'passive':
      return ichidanTensed(kS + 'られ', nS + 'られ', register, tense, polarity)

    case 'causative':
      return ichidanTensed(kS + 'させ', nS + 'させ', register, tense, polarity)

    case 'passive_causative':
      return ichidanTensed(kS + 'させられ', nS + 'させられ', register, tense, polarity)

    case 'imperative': {
      if (polarity === 'positive') return buildPairs(kS + 'ろ',          nS + 'ろ')
      if (polarity === 'negative') return buildPairs(word.kanji + 'な',  kana + 'な')
      return null
    }

    default:
      return null
  }
}

// 来る has irregular readings per conjugation context — hardcoded kanji/kana pairs.
function conjugateKuru(word, formKey, register, tense, polarity) {
  switch (formKey) {
    case 'default': {
      if (register === 'plain') {
        if (tense === 'present' && polarity === 'positive') return ['来る', 'くる']
        if (tense === 'present' && polarity === 'negative') return ['来ない', 'こない']
        if (tense === 'past'    && polarity === 'positive') return ['来た', 'きた']
        if (tense === 'past'    && polarity === 'negative') return ['来なかった', 'こなかった']
      }
      if (register === 'polite') {
        if (tense === 'present' && polarity === 'positive') return ['来ます', 'きます']
        if (tense === 'present' && polarity === 'negative') return ['来ません', 'きません']
        if (tense === 'past'    && polarity === 'positive') return ['来ました', 'きました']
        if (tense === 'past'    && polarity === 'negative') return ['来ませんでした', 'きませんでした']
      }
      return null
    }

    case 'te': {
      if (polarity === 'positive') return ['来て', 'きて']
      if (polarity === 'negative') return ['来ないで', 'こないで']
      return null
    }

    case 'conditional': {
      if (polarity === 'positive') return ['来れば', 'くれば']
      if (polarity === 'negative') return ['来なければ', 'こなければ']
      return null
    }

    case 'volitional': {
      if (register === 'plain')  return ['来よう', 'こよう']
      if (register === 'polite') return ['来ましょう', 'きましょう']
      return null
    }

    case 'potential': {
      const standard = ichidanTensed('来られ', 'こられ', register, tense, polarity)
      const ranuki   = ichidanTensed('来れ',   'これ',   register, tense, polarity)
      if (!standard) return null
      return [...new Set([...standard, ...(ranuki || [])])]
    }

    case 'passive':
      return ichidanTensed('来られ', 'こられ', register, tense, polarity)

    case 'causative':
      return ichidanTensed('来させ', 'こさせ', register, tense, polarity)

    case 'passive_causative':
      return ichidanTensed('来させられ', 'こさせられ', register, tense, polarity)

    case 'imperative': {
      if (polarity === 'positive') return ['来い', 'こい']
      if (polarity === 'negative') return ['来るな', 'くるな']
      return null
    }

    default:
      return null
  }
}

// Handles する and X+する compound verbs (group 3, kana ends in する).
function conjugateSuru(word, formKey, register, tense, polarity) {
  const kP = word.kanji.slice(0, -2)
  const nP = word.kana.slice(0, -2)

  switch (formKey) {
    case 'default': {
      if (register === 'plain') {
        if (tense === 'present' && polarity === 'positive') return buildPairs(kP + 'する',       nP + 'する')
        if (tense === 'present' && polarity === 'negative') return buildPairs(kP + 'しない',     nP + 'しない')
        if (tense === 'past'    && polarity === 'positive') return buildPairs(kP + 'した',        nP + 'した')
        if (tense === 'past'    && polarity === 'negative') return buildPairs(kP + 'しなかった',  nP + 'しなかった')
      }
      if (register === 'polite') {
        if (tense === 'present' && polarity === 'positive') return buildPairs(kP + 'します',           nP + 'します')
        if (tense === 'present' && polarity === 'negative') return buildPairs(kP + 'しません',         nP + 'しません')
        if (tense === 'past'    && polarity === 'positive') return buildPairs(kP + 'しました',         nP + 'しました')
        if (tense === 'past'    && polarity === 'negative') return buildPairs(kP + 'しませんでした',   nP + 'しませんでした')
      }
      return null
    }

    case 'te': {
      if (polarity === 'positive') return buildPairs(kP + 'して',      nP + 'して')
      if (polarity === 'negative') return buildPairs(kP + 'しないで',  nP + 'しないで')
      return null
    }

    case 'conditional': {
      if (polarity === 'positive') return buildPairs(kP + 'すれば',      nP + 'すれば')
      if (polarity === 'negative') return buildPairs(kP + 'しなければ',  nP + 'しなければ')
      return null
    }

    case 'volitional': {
      if (register === 'plain')  return buildPairs(kP + 'しよう',    nP + 'しよう')
      if (register === 'polite') return buildPairs(kP + 'しましょう', nP + 'しましょう')
      return null
    }

    // できる as potential (ichidan verb)
    case 'potential':
      return ichidanTensed(kP + 'でき', nP + 'でき', register, tense, polarity)

    case 'passive':
      return ichidanTensed(kP + 'され', nP + 'され', register, tense, polarity)

    case 'causative':
      return ichidanTensed(kP + 'させ', nP + 'させ', register, tense, polarity)

    case 'passive_causative':
      return ichidanTensed(kP + 'させられ', nP + 'させられ', register, tense, polarity)

    case 'imperative': {
      if (polarity === 'positive') return buildPairs(kP + 'しろ',    nP + 'しろ')
      if (polarity === 'negative') return buildPairs(kP + 'するな',  nP + 'するな')
      return null
    }

    default:
      return null
  }
}

function conjugateIAdj(word, formKey, register, tense, polarity) {
  // いい is irregular: all forms except plain present positive conjugate from よ- stem.
  const isIi = word.kana === 'いい'
  const kS = isIi ? (word.kanji === 'いい' ? 'よ' : word.kanji.slice(0, -1)) : word.kanji.slice(0, -1)
  const nS = isIi ? 'よ' : word.kana.slice(0, -1)

  switch (formKey) {
    case 'default': {
      if (register === 'plain') {
        if (tense === 'present' && polarity === 'positive') return buildPairs(word.kanji,          word.kana)
        if (tense === 'present' && polarity === 'negative') return buildPairs(kS + 'くない',       nS + 'くない')
        if (tense === 'past'    && polarity === 'positive') return buildPairs(kS + 'かった',       nS + 'かった')
        if (tense === 'past'    && polarity === 'negative') return buildPairs(kS + 'くなかった',   nS + 'くなかった')
      }
      if (register === 'polite') {
        if (tense === 'present' && polarity === 'positive') return buildPairs(word.kanji + 'です',         word.kana + 'です')
        if (tense === 'present' && polarity === 'negative') return buildPairs(kS + 'くないです',           nS + 'くないです')
        if (tense === 'past'    && polarity === 'positive') return buildPairs(kS + 'かったです',           nS + 'かったです')
        if (tense === 'past'    && polarity === 'negative') return buildPairs(kS + 'くなかったです',       nS + 'くなかったです')
      }
      return null
    }

    case 'te': {
      if (polarity === 'positive') return buildPairs(kS + 'くて',      nS + 'くて')
      if (polarity === 'negative') return buildPairs(kS + 'くなくて',  nS + 'くなくて')
      return null
    }

    case 'conditional': {
      if (polarity === 'positive') return buildPairs(kS + 'ければ',      nS + 'ければ')
      if (polarity === 'negative') return buildPairs(kS + 'くなければ',  nS + 'くなければ')
      return null
    }

    case 'adverbial':
      return buildPairs(kS + 'く', nS + 'く')

    default:
      return null
  }
}

// な-adjectives and nouns share the same copula conjugation pattern.
function conjugateCopula(word, formKey, register, tense, polarity) {
  const kK = word.kanji
  const kN = word.kana

  switch (formKey) {
    case 'default': {
      if (register === 'plain') {
        if (tense === 'present' && polarity === 'positive') return buildPairs(kK + 'だ',           kN + 'だ')
        if (tense === 'present' && polarity === 'negative') return buildPairs(kK + 'じゃない',     kN + 'じゃない')
        if (tense === 'past'    && polarity === 'positive') return buildPairs(kK + 'だった',       kN + 'だった')
        if (tense === 'past'    && polarity === 'negative') return buildPairs(kK + 'じゃなかった', kN + 'じゃなかった')
      }
      if (register === 'polite') {
        if (tense === 'present' && polarity === 'positive') return buildPairs(kK + 'です',             kN + 'です')
        if (tense === 'present' && polarity === 'negative') return buildPairs(kK + 'じゃないです',     kN + 'じゃないです')
        if (tense === 'past'    && polarity === 'positive') return buildPairs(kK + 'でした',           kN + 'でした')
        if (tense === 'past'    && polarity === 'negative') return buildPairs(kK + 'じゃなかったです', kN + 'じゃなかったです')
      }
      return null
    }

    case 'te': {
      if (polarity === 'positive') return buildPairs(kK + 'で',          kN + 'で')
      if (polarity === 'negative') return buildPairs(kK + 'じゃなくて',  kN + 'じゃなくて')
      return null
    }

    case 'conditional': {
      if (word.wordType === 'noun') return null
      if (polarity === 'positive') return buildPairs(kK + 'なら',         kN + 'なら')
      if (polarity === 'negative') return buildPairs(kK + 'じゃなければ', kN + 'じゃなければ')
      return null
    }

    case 'adverbial':
      if (word.wordType === 'noun') return null
      return buildPairs(kK + 'に', kN + 'に')

    default:
      return null
  }
}

// Returns an array of accepted answer strings (kanji + kana versions) for a given
// word × form × tense/polarity/register combination, or null if the combination is invalid.
export function conjugate(word, formKey, register, tense, polarity) {
  if (!word || !formKey) return null

  const { wordType, group } = word

  if (wordType === 'verb') {
    if (group === 3) {
      if (word.kana.endsWith('する')) return conjugateSuru(word, formKey, register, tense, polarity)
      if (word.kana === 'くる')       return conjugateKuru(word, formKey, register, tense, polarity)
      return null
    }
    if (group === 2) return conjugateIchidan(word, formKey, register, tense, polarity)
    if (group === 1) return conjugateGodan(word, formKey, register, tense, polarity)
    return null
  }

  if (wordType === 'adjective') {
    if (group === 'i')  return conjugateIAdj(word, formKey, register, tense, polarity)
    if (group === 'na') return conjugateCopula(word, formKey, register, tense, polarity)
    return null
  }

  if (wordType === 'noun') return conjugateCopula(word, formKey, register, tense, polarity)

  return null
}

export function test() {
  const words = [
    { id: 'kaku',   kanji: '書く',   kana: 'かく',   wordType: 'verb', group: 1 },
    { id: 'taberu', kanji: '食べる', kana: 'たべる', wordType: 'verb', group: 2 },
  ]

  const combos = [
    { formKey: 'default',           register: 'plain',  tense: 'present', polarity: 'positive' },
    { formKey: 'default',           register: 'plain',  tense: 'present', polarity: 'negative' },
    { formKey: 'default',           register: 'plain',  tense: 'past',    polarity: 'positive' },
    { formKey: 'default',           register: 'plain',  tense: 'past',    polarity: 'negative' },
    { formKey: 'default',           register: 'polite', tense: 'present', polarity: 'positive' },
    { formKey: 'default',           register: 'polite', tense: 'present', polarity: 'negative' },
    { formKey: 'default',           register: 'polite', tense: 'past',    polarity: 'positive' },
    { formKey: 'default',           register: 'polite', tense: 'past',    polarity: 'negative' },
    { formKey: 'te',                register: null,     tense: null,      polarity: 'positive' },
    { formKey: 'te',                register: null,     tense: null,      polarity: 'negative' },
    { formKey: 'conditional',       register: null,     tense: null,      polarity: 'positive' },
    { formKey: 'conditional',       register: null,     tense: null,      polarity: 'negative' },
    { formKey: 'volitional',        register: 'plain',  tense: null,      polarity: null       },
    { formKey: 'volitional',        register: 'polite', tense: null,      polarity: null       },
    { formKey: 'potential',         register: 'plain',  tense: 'present', polarity: 'positive' },
    { formKey: 'potential',         register: 'plain',  tense: 'present', polarity: 'negative' },
    { formKey: 'potential',         register: 'plain',  tense: 'past',    polarity: 'positive' },
    { formKey: 'potential',         register: 'plain',  tense: 'past',    polarity: 'negative' },
    { formKey: 'potential',         register: 'polite', tense: 'present', polarity: 'positive' },
    { formKey: 'potential',         register: 'polite', tense: 'present', polarity: 'negative' },
    { formKey: 'potential',         register: 'polite', tense: 'past',    polarity: 'positive' },
    { formKey: 'potential',         register: 'polite', tense: 'past',    polarity: 'negative' },
    { formKey: 'passive',           register: 'plain',  tense: 'present', polarity: 'positive' },
    { formKey: 'passive',           register: 'plain',  tense: 'present', polarity: 'negative' },
    { formKey: 'passive',           register: 'plain',  tense: 'past',    polarity: 'positive' },
    { formKey: 'passive',           register: 'plain',  tense: 'past',    polarity: 'negative' },
    { formKey: 'passive',           register: 'polite', tense: 'present', polarity: 'positive' },
    { formKey: 'passive',           register: 'polite', tense: 'present', polarity: 'negative' },
    { formKey: 'passive',           register: 'polite', tense: 'past',    polarity: 'positive' },
    { formKey: 'passive',           register: 'polite', tense: 'past',    polarity: 'negative' },
    { formKey: 'causative',         register: 'plain',  tense: 'present', polarity: 'positive' },
    { formKey: 'causative',         register: 'plain',  tense: 'present', polarity: 'negative' },
    { formKey: 'causative',         register: 'plain',  tense: 'past',    polarity: 'positive' },
    { formKey: 'causative',         register: 'plain',  tense: 'past',    polarity: 'negative' },
    { formKey: 'causative',         register: 'polite', tense: 'present', polarity: 'positive' },
    { formKey: 'causative',         register: 'polite', tense: 'present', polarity: 'negative' },
    { formKey: 'causative',         register: 'polite', tense: 'past',    polarity: 'positive' },
    { formKey: 'causative',         register: 'polite', tense: 'past',    polarity: 'negative' },
    { formKey: 'passive_causative', register: 'plain',  tense: 'present', polarity: 'positive' },
    { formKey: 'passive_causative', register: 'plain',  tense: 'present', polarity: 'negative' },
    { formKey: 'passive_causative', register: 'plain',  tense: 'past',    polarity: 'positive' },
    { formKey: 'passive_causative', register: 'plain',  tense: 'past',    polarity: 'negative' },
    { formKey: 'passive_causative', register: 'polite', tense: 'present', polarity: 'positive' },
    { formKey: 'passive_causative', register: 'polite', tense: 'present', polarity: 'negative' },
    { formKey: 'passive_causative', register: 'polite', tense: 'past',    polarity: 'positive' },
    { formKey: 'passive_causative', register: 'polite', tense: 'past',    polarity: 'negative' },
    { formKey: 'imperative',        register: null,     tense: null,      polarity: 'positive' },
    { formKey: 'imperative',        register: null,     tense: null,      polarity: 'negative' },
  ]

  for (const word of words) {
    console.log(`\n${'═'.repeat(60)}`)
    console.log(`  ${word.kanji} (${word.kana})  ${word.wordType} group ${word.group}`)
    console.log('═'.repeat(60))
    for (const { formKey, register, tense, polarity } of combos) {
      const result = conjugate(word, formKey, register, tense, polarity)
      const label = [formKey, register, tense, polarity].filter(Boolean).join('_')
      console.log(`  ${label.padEnd(44)} ${result ? result.join('  /  ') : '—'}`)
    }
  }
}
