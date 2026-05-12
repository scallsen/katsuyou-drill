# Doushi Drill — codebase guide

Japanese verb conjugation drill app. Vite + React, no TypeScript.

## Git workflow
- **Always create a feature branch before making any code changes.** Never commit directly to `main`.

## Conventions
- **Inline styles only** — no CSS modules, no Tailwind. The one exception is `FlipCard.css` (3D flip animation that needs CSS classes).
- **No comments** unless the WHY is non-obvious (a hidden constraint, a workaround, a subtle invariant).
- **No TypeScript** — plain JS throughout.
- `src/pages/CardPreview.jsx` is a dev sandbox for visual testing. `DrillPage` is the real entry point (`App.jsx` renders it).
- `src/pages/ColorReview.jsx` is a **color/appearance testing page** — navigate to `/#/color-review` in the dev server to see a static grid of all 11 card variants (4 columns × 2 rows each). Use it to tweak card visuals in isolation without loading the full drill. Routing is hash-based in `App.jsx`.

## How the drill works

Options drawer → `buildPool()` → `useDrill(pool, { engine, seekCardId })` → renders cards one at a time.

- **Pool** — flat array of card specs, one per valid `(word × form × register/tense/polarity)` combo. Built by `src/data/drill.js::buildPool()`.
- **Float** — the active hand of ~7 cards. `float[0]` is always current. Correct answers retire the card and pull a fresh one from the pool. Wrong answers reinsert the card a few positions ahead so it returns after a short gap.
- **Streak** — increments on correct, resets to 0 on wrong.
- **Seek** — when a sidebar filter is toggled, `DrillPage` synchronously computes the new pool, finds the best matching card via `findSeekCard` (scoring: same word +8, same form +4, same register/tense/polarity +2 each), and passes its id as `seekCardId` to `useDrill`. On pool reinit, `useDrill` moves that card to `float[0]`. Adding a filter biases toward cards that match the new axis/value; removing one just finds the most similar valid card.

## Adding a new drill engine

Create `src/engines/myEngine.js` with this contract:

```js
export const label = 'Display Name'
export const description = 'One sentence shown in the Algorithm section of the options drawer.'

export function init(pool, floatSize) {
  // shuffle pool, take first floatSize as float
  return { float, pool, retired, streak, bestStreak: 0, totalCorrect, totalWrong, prevSnapshot: null }
}

export function onCorrect(state) {
  // retire float[0], pull next card from pool, increment streak
  // must update bestStreak and set prevSnapshot: { ...state, prevSnapshot: null }
  return newState
}

export function onWrong(state) {
  // reinsert float[0] later in float, reset streak
  // must set prevSnapshot: { ...state, prevSnapshot: null }
  return newState
}

// optional — enables undo
export function onUndo(state) {
  if (!state.prevSnapshot) return state
  return { ...state.prevSnapshot, prevSnapshot: null }
}
```

Then register it in `src/hooks/useDrill.js`:

```js
import * as MyEngine from '../engines/myEngine.js'

export const ENGINES = {
  simpleQueue: SimpleQueue,
  myEngine: MyEngine,   // ← add here
}
```

It will automatically appear as a selectable option in the options drawer.

## Key files

| File | Purpose |
|---|---|
| `src/data/conjugation.js` | `conjugate(word, formKey, register, tense, polarity)` — algorithmic conjugation for verbs, adjectives, nouns; returns accepted-answer array (kanji + kana) |
| `src/data/drill.js` | `buildPool`, `filterWords`, `resolveVariant` |
| `src/data/illegalCombos.js` | Declarative list of card combos to suppress (e.g. trivial/duplicate answers); checked in `buildPool()` |
| `src/data/forms.js` | `FORMS` — all form/register definitions with axes and colors |
| `src/data/words.json` | Word entries — id, kanji, kana, wordType, group, jlpt; no conjugation tables (computed at runtime) |
| `src/engines/simpleQueue.js` | Default engine — float + wrong-card reinsertion |
| `src/hooks/useDrill.js` | React wrapper for any engine; `ENGINES` registry; seek-on-reinit |
| `src/hooks/useTTS.js` | Web Speech API wrapper; speaks `conjugation` on card flip-to-back; `ttsEnabled` persisted in localStorage |
| `src/hooks/useSFX.js` | Web Audio API sound effects: `flip_card`, `draw_card`, `flip_card_correct` (pitch scales with streak), `flip_card_wrong`, `best_streak_broken` |
| `src/components/DrillHUD.jsx` | HUD wrapper: streak display with pop/wiggle/wave animations, best streak, show/hide stats toggle, undo button |
| `src/pages/DrillPage.jsx` | Main page — options state, pool memoization, drill rendering, `findSeekCard` |
| `src/components/ConjugationCard/` | Card component family (CardShell, CardContent, variants) |
| `src/pages/ColorReview.jsx` | Static color/appearance testing grid — all variants, all states |

## Card spec shape

Output of `buildPool()`, input to engine and card rendering:

```js
{
  id,              // "${word.id}__${formKey}__${register}__..." — unique, used as React key
  word,            // full word object from words.json
  formKey, register, tense, polarity,
  conjugation,     // canonical answer string (kanji form) — shown on card back, spoken by TTS
  acceptedAnswers, // string[] — all accepted answers for grading (kanji + kana variants)
  variant,         // variant key for ConjugationCard (e.g. 'plain', 'te', 'potential')
  bgColor,         // form accent color string
}
// UI derives: bgComponent (register==='plain' → PlainBg), registerLabel (VARIANTS[register]?.label)
```

## Card appearance notes

- **`backColor`** — optional field in `FORMS` / `variants`. Overrides the back-face background color (e.g. plain/polite use `#4C4C4C`; all others fall back to `keyColor`). When set, `PlainBg` on the back also receives `backColor` as its `color` prop so the ruled lines are derived from the dark bg rather than the form accent color.
- **Stamps** — rendered as plain text labels (`DotGothic16`, uppercase, same color as the word text). Past label sits bottom-left, Negative bottom-right.
- **`PlainBg` contrast** — front lines use `lightenHex(hex, 0.60/0.68)`, back lines use `lightenHex(hex, 0.20/0.25)` (lower = closer to the vivid key color, less contrast).
