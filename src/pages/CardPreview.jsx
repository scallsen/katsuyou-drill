import { useState } from 'react'
import ConjugationCard from '../components/ConjugationCard/index.jsx'
import VARIANTS from '../components/ConjugationCard/variants.js'
import PlainBg from '../components/ConjugationCard/backgrounds/PlainBg.jsx'
import SelectButton from '../components/SelectButton.jsx'
import DrawerSectionHeader from '../components/DrawerSectionHeader.jsx'
import SelectionError from '../components/SelectionError.jsx'
import { WORD_TYPES, REGISTERS, REGISTER_KEYS, GRAMMAR_FORMS, TENSES, POLARITIES } from '../data/options.js'
import { filterWords, resolveVariant } from '../data/drill.js'
import { conjugate } from '../data/conjugation.js'

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

export default function CardPreview() {
  // Test controls — drive the preview card
  const [variant,  setVariant]  = useState('plain')
  const [word,     setWord]     = useState('食べる')
  const [negative, setNegative] = useState(false)
  const [past,     setPast]     = useState(false)

  const [showOptions,      setShowOptions]      = useState(false)
  const [showTestControls, setShowTestControls] = useState(false)

  // Options drawer state
  const [selectedWordTypes,  setSelectedWordTypes]  = useState([])
  const [selectedRegisters,  setSelectedRegisters]  = useState([])
  const [selectedForms,      setSelectedForms]      = useState([])
  const [selectedTenses,     setSelectedTenses]     = useState(['present'])
  const [selectedPolarities, setSelectedPolarities] = useState(['positive'])

  const verbSelected = ['u-verb', 'ru-verb', 'irregular'].some(k => selectedWordTypes.includes(k))

  // Drill mode: active when at least one word type is selected
  const drillMode = selectedWordTypes.length > 0
  const filteredWords = drillMode ? filterWords(selectedWordTypes) : []
  const activeWord    = filteredWords[0] ?? null
  const activeForm    = selectedForms[0] ?? 'default'
  const activeReg     = selectedRegisters[0] ?? null
  const activeTense   = selectedTenses[0] ?? 'present'
  const activePolarity = selectedPolarities[0] ?? 'positive'
  const conjugation   = conjugate(activeWord, activeForm, activeReg, activeTense, activePolarity)?.[0] ?? null
  const drillVariant  = resolveVariant(activeForm, activeReg)

  // Values passed to the card — drill data takes priority over test controls
  const cardWord     = drillMode ? (activeWord?.kanji ?? '—') : word
  const cardAnswer   = drillMode ? conjugation : null
  const cardVariant  = drillMode ? drillVariant : variant
  const cardNegative = drillMode ? activePolarity === 'negative' : negative
  const cardPast     = drillMode ? activeTense === 'past' : past
  // Show plain texture whenever register is plain, using the active form's key color
  const cardBgComponent    = drillMode && activeReg === 'plain' ? PlainBg : null
  const cardRegisterLabel  = drillMode && activeReg ? VARIANTS[activeReg]?.label ?? null : null

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#1E1E1E', fontFamily: "'DotGothic16', system-ui, sans-serif", overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', zIndex: 10 }}>
        <div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em' }}>Katsuyō Drill</div>
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
          {showOptions ? 'Hide options' : 'Show options'}
        </button>
      </div>

      {/* Card + hint */}
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <ConjugationCard variant={cardVariant} word={cardWord} answer={cardAnswer} negative={cardNegative} past={cardPast} bgComponent={cardBgComponent} registerLabel={cardRegisterLabel} />
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Click to flip card</div>
      </div>

      {/* Bottom text link — test controls toggle */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <button
          onClick={() => setShowTestControls(v => !v)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {showTestControls ? 'hide test controls' : 'test controls'}
        </button>
      </div>

      {/* Test controls panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          left: '50%',
          transform: showTestControls ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(calc(100% + 60px))',
          transition: 'transform 220ms ease',
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
          zIndex: 20,
        }}
      >
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 8, fontSize: 12 }}>Variant</legend>
          {Object.keys(VARIANTS).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: 13, cursor: 'pointer', color: '#fff' }}>
              <input type="radio" name="variant" value={key} checked={variant === key} onChange={() => setVariant(key)} />
              {VARIANTS[key].label}
            </label>
          ))}
        </fieldset>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6, fontSize: 12 }}>Word</label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              style={{ width: 160, padding: '5px 8px', fontSize: 14, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#fff' }}>
            <input type="checkbox" checked={negative} onChange={(e) => setNegative(e.target.checked)} />
            Negative
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#fff' }}>
            <input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} />
            Past
          </label>
        </div>
      </div>

      {/* Options drawer */}
      <div
        style={{
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
        }}
      >
        {/* Drawer header */}
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
            <DrawerSectionHeader
              title="Words"
              hasSelections={selectedWordTypes.length > 0}
              onClearAll={() => setSelectedWordTypes([])}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {WORD_TYPES.map(({ key, label }) => (
                <SelectButton
                  key={key}
                  selected={selectedWordTypes.includes(key)}
                  onClick={() => setSelectedWordTypes(v => toggle(v, key))}
                >
                  {label}
                </SelectButton>
              ))}
            </div>
            <SelectionError visible={selectedWordTypes.length === 0} />
          </div>

          {/* Verb register */}
          {verbSelected && <div style={{ marginTop: 28 }}>
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
          </div>}

          {/* Verb forms */}
          {verbSelected && <div style={{ marginTop: 28 }}>
            <DrawerSectionHeader
              title="Verb forms"
              hasSelections={selectedForms.length > 0}
              onClearAll={() => setSelectedForms([])}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GRAMMAR_FORMS.map(({ key, label, keyColor, subtext }) => (
                <SelectButton
                  key={key}
                  selected={selectedForms.includes(key)}
                  borderColor={keyColor}
                  subtext={subtext}
                  onClick={() => setSelectedForms(v => toggle(v, key))}
                >
                  {label}
                </SelectButton>
              ))}
            </div>
            <SelectionError visible={selectedForms.length === 0} />
          </div>}

          {/* Tense */}
          <div style={{ marginTop: 28 }}>
            <DrawerSectionHeader title="Tense" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TENSES.map(({ key, label }) => (
                <SelectButton
                  key={key}
                  selected={selectedTenses.includes(key)}
                  onClick={() => setSelectedTenses(v => toggle(v, key))}
                >
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
                <SelectButton
                  key={key}
                  selected={selectedPolarities.includes(key)}
                  onClick={() => setSelectedPolarities(v => toggle(v, key))}
                >
                  {label}
                </SelectButton>
              ))}
            </div>
            <SelectionError visible={selectedPolarities.length === 0} />
          </div>

        </div>
      </div>

    </div>
  )
}
