# Doushi Drill — codebase guide

Japanese verb conjugation drill app. Vite + React, no TypeScript.

## Conventions
- **Inline styles only** — no CSS modules, no Tailwind. The one exception is `FlipCard.css` (3D flip animation that needs CSS classes).
- **No comments** unless the WHY is non-obvious (a hidden constraint, a workaround, a subtle invariant).
- **No TypeScript** — plain JS throughout.
- `src/pages/CardPreview.jsx` is a dev sandbox for visual testing. `DrillPage` is the real entry point (`App.jsx` renders it).

## How the drill works

Options drawer → `buildPool()` → `useDrill(pool, { engine, seekCardId })` → renders cards one at a time.

- **Pool** — flat array of card specs, one per valid `(word × form × subKey)` combo. Built by `src/data/drill.js::buildPool()`.
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
  return { float, pool, retired, streak, totalCorrect, totalWrong }
}

export function onCorrect(state) {
  // retire float[0], pull next card from pool, increment streak
  return newState
}

export function onWrong(state) {
  // reinsert float[0] later in float, reset streak
  return newState
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
| `src/data/drill.js` | `buildPool`, `filterWords`, `buildSubKey`, `getConjugation`, `resolveVariant` |
| `src/data/illegalCombos.js` | Declarative list of card combos to suppress (e.g. trivial/duplicate answers); checked in `buildPool()` |
| `src/data/forms.js` | `FORMS` — all form/register definitions with axes and colors |
| `src/data/words.json` | Word entries with conjugation tables |
| `src/engines/simpleQueue.js` | Default engine — float + wrong-card reinsertion |
| `src/hooks/useDrill.js` | React wrapper for any engine; `ENGINES` registry; seek-on-reinit |
| `src/pages/DrillPage.jsx` | Main page — options state, pool memoization, drill rendering, `findSeekCard` |
| `src/components/ConjugationCard/` | Card component family (CardShell, CardContent, variants) |

## Card spec shape

Output of `buildPool()`, input to engine and card rendering:

```js
{
  id,           // "${word.id}__${formKey}__${subKey}" — unique, used as React key
  word,         // full word object from words.json
  formKey, subKey, register, tense, polarity,
  conjugation,  // the answer string shown on card back
  variant,      // variant key for ConjugationCard (e.g. 'plain', 'te', 'potential')
  bgColor,      // form accent color string
}
// UI derives: bgComponent (register==='plain' → PlainBg), registerLabel (VARIANTS[register]?.label)
```
