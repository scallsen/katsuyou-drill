import { useState, useMemo } from 'react'
import ConjugationCard from '../components/ConjugationCard/index.jsx'
import VARIANTS from '../components/ConjugationCard/variants.js'
import PlainBg from '../components/ConjugationCard/backgrounds/PlainBg.jsx'
import SelectButton from '../components/SelectButton.jsx'
import DrawerSectionHeader from '../components/DrawerSectionHeader.jsx'
import SelectionError from '../components/SelectionError.jsx'
import { WORD_TYPES, REGISTERS, GRAMMAR_FORMS, TENSES, POLARITIES } from '../data/options.js'
import { buildPool } from '../data/drill.js'
import { useDrill, ENGINES } from '../hooks/useDrill.js'

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function ActiveDrill({ drill }) {
  // Track which card id the user has flipped — naturally resets when card changes.
  const [flippedCardId, setFlippedCardId] = useState(null)
  const { currentCard, streak, totalCorrect, totalWrong, remaining } = drill
  const isFlipped = flippedCardId === currentCard.id

  function handleFlip(flipped) {
    setFlippedCardId(flipped ? currentCard.id : null)
  }

  const bgComponent    = currentCard.register === 'plain' ? PlainBg : null
  const registerLabel  = currentCard.register ? VARIANTS[currentCard.register]?.label ?? null : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      {/* Streak counter — reserves space so layout doesn't shift */}
      <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {streak > 0 && (
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: "'DotGothic16', sans-serif", letterSpacing: '0.05em' }}>
            {streak}
          </div>
        )}
      </div>

      <ConjugationCard
        key={currentCard.id}
        variant={currentCard.variant}
        word={currentCard.word.kanji}
        answer={currentCard.conjugation}
        negative={currentCard.polarity === 'negative'}
        past={currentCard.tense === 'past'}
        bgComponent={bgComponent}
        bgComponentColor={currentCard.bgColor}
        registerLabel={registerLabel}
        onFlip={handleFlip}
      />

      {/* Action area */}
      {isFlipped ? (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={drill.onWrong}
            style={{
              padding: '10px 28px',
              fontSize: 14,
              fontFamily: 'inherit',
              background: 'rgba(192, 57, 43, 0.85)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            Wrong
          </button>
          <button
            onClick={drill.onCorrect}
            style={{
              padding: '10px 28px',
              fontSize: 14,
              fontFamily: 'inherit',
              background: 'rgba(39, 174, 96, 0.85)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            Correct
          </button>
        </div>
      ) : (
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Click to flip</div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: "'DotGothic16', sans-serif" }}>
        <span>{remaining} remaining</span>
        <span>{totalCorrect} correct</span>
        {totalWrong > 0 && <span>{totalWrong} wrong</span>}
      </div>
    </div>
  )
}

function DoneScreen({ totalCorrect, totalWrong, onRestart }) {
  return (
    <div style={{ textAlign: 'center', fontFamily: "'DotGothic16', sans-serif" }}>
      <div style={{ color: '#fff', fontSize: 28, letterSpacing: '0.05em', marginBottom: 12 }}>All done!</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 28 }}>
        {totalCorrect} correct &nbsp;·&nbsp; {totalWrong} wrong
      </div>
      <button
        onClick={onRestart}
        style={{
          padding: '10px 28px',
          fontSize: 14,
          fontFamily: 'inherit',
          background: 'rgba(255,255,255,0.12)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}
      >
        Restart
      </button>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DrillPage() {
  const [showOptions,       setShowOptions]       = useState(false)
  const [selectedWordTypes, setSelectedWordTypes] = useState([])
  const [selectedRegisters, setSelectedRegisters] = useState([])
  const [selectedForms,     setSelectedForms]     = useState([])
  const [selectedTenses,    setSelectedTenses]    = useState(['present'])
  const [selectedPolarities, setSelectedPolarities] = useState(['positive'])
  const [selectedEngine,    setSelectedEngine]    = useState('simpleQueue')

  const verbSelected = ['u-verb', 'ru-verb', 'irregular'].some(k => selectedWordTypes.includes(k))
  const drillMode    = selectedWordTypes.length > 0

  // Stable key — only changes when option content changes, not on every render.
  const poolKey = [selectedWordTypes, selectedForms, selectedRegisters, selectedTenses, selectedPolarities]
    .map(a => [...a].sort().join(','))
    .join('|')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pool = useMemo(() => buildPool({ selectedWordTypes, selectedForms, selectedRegisters, selectedTenses, selectedPolarities }), [poolKey])

  const engine = ENGINES[selectedEngine]
  const drill  = useDrill(pool, { engine })

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#2E2E2E',
      fontFamily: "'DotGothic16', system-ui, sans-serif",
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', zIndex: 10 }}>
        <div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em' }}>Doushi Drill v0.1</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 }}>by Simon Callsen</div>
        </div>
        <button
          onClick={() => setShowOptions(v => !v)}
          style={{
            padding: '7px 16px',
            fontSize: 13,
            fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {showOptions ? 'Hide options' : 'Options'}
        </button>
      </div>

      {/* Center */}
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!drillMode ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Open options to start drilling</div>
        ) : pool.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No cards match your selections</div>
        ) : drill.done ? (
          <DoneScreen totalCorrect={drill.totalCorrect} totalWrong={drill.totalWrong} onRestart={drill.restart} />
        ) : (
          <ActiveDrill drill={drill} />
        )}
      </div>

      {/* Options drawer */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 260,
        height: '100%',
        background: '#1a1a1a',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        transform: showOptions ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 220ms ease',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Options</div>
          <button
            onClick={() => setShowOptions(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            Hide
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 24px' }}>

          {/* Words */}
          <div style={{ marginTop: 24 }}>
            <DrawerSectionHeader title="Words" hasSelections={selectedWordTypes.length > 0} onClearAll={() => setSelectedWordTypes([])} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {WORD_TYPES.map(({ key, label }) => (
                <SelectButton key={key} selected={selectedWordTypes.includes(key)} onClick={() => setSelectedWordTypes(v => toggle(v, key))}>
                  {label}
                </SelectButton>
              ))}
            </div>
            <SelectionError visible={selectedWordTypes.length === 0} />
          </div>

          {/* Verb register */}
          {verbSelected && (
            <div style={{ marginTop: 28 }}>
              <DrawerSectionHeader title="Verb register" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {REGISTERS.map(({ key, subtext }) => (
                  <SelectButton
                    key={key}
                    selected={selectedRegisters.includes(key)}
                    bgColor={VARIANTS[key].bgColor}
                    borderColor={VARIANTS[key].keyColor}
                    subtext={subtext}
                    onClick={() => setSelectedRegisters(v => toggle(v, key))}
                  >
                    {VARIANTS[key].label}
                  </SelectButton>
                ))}
              </div>
              <SelectionError visible={selectedRegisters.length === 0} />
            </div>
          )}

          {/* Verb forms */}
          {verbSelected && (
            <div style={{ marginTop: 28 }}>
              <DrawerSectionHeader title="Verb forms" hasSelections={selectedForms.length > 0} onClearAll={() => setSelectedForms([])} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {GRAMMAR_FORMS.map(({ key, label, bgColor, keyColor, subtext }) => (
                  <SelectButton
                    key={key}
                    selected={selectedForms.includes(key)}
                    bgColor={bgColor}
                    borderColor={keyColor}
                    subtext={subtext}
                    onClick={() => setSelectedForms(v => toggle(v, key))}
                  >
                    {label}
                  </SelectButton>
                ))}
              </div>
              <SelectionError visible={selectedForms.length === 0} />
            </div>
          )}

          {/* Tense */}
          <div style={{ marginTop: 28 }}>
            <DrawerSectionHeader title="Tense" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TENSES.map(({ key, label }) => (
                <SelectButton key={key} selected={selectedTenses.includes(key)} onClick={() => setSelectedTenses(v => toggle(v, key))}>
                  {label}
                </SelectButton>
              ))}
            </div>
            <SelectionError visible={selectedTenses.length === 0} />
          </div>

          {/* Polarity */}
          <div style={{ marginTop: 28 }}>
            <DrawerSectionHeader title="Polarity" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {POLARITIES.map(({ key, label }) => (
                <SelectButton key={key} selected={selectedPolarities.includes(key)} onClick={() => setSelectedPolarities(v => toggle(v, key))}>
                  {label}
                </SelectButton>
              ))}
            </div>
            <SelectionError visible={selectedPolarities.length === 0} />
          </div>

          {/* Algorithm */}
          <div style={{ marginTop: 28 }}>
            <DrawerSectionHeader title="Algorithm" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(ENGINES).map(([key, eng]) => (
                <div key={key}>
                  <SelectButton selected={selectedEngine === key} onClick={() => setSelectedEngine(key)}>
                    {eng.label}
                  </SelectButton>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4, paddingLeft: 2, lineHeight: 1.4 }}>
                    {eng.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
