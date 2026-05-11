import { useState, useMemo, useEffect, useRef } from 'react'
import ConjugationCard from '../components/ConjugationCard/index.jsx'
import VARIANTS from '../components/ConjugationCard/variants.js'
import PlainBg from '../components/ConjugationCard/backgrounds/PlainBg.jsx'
import SelectButton from '../components/SelectButton.jsx'
import DrawerSectionHeader from '../components/DrawerSectionHeader.jsx'
import SelectionError from '../components/SelectionError.jsx'
import { WORD_TYPES, REGISTERS, GRAMMAR_FORMS, TENSES, POLARITIES } from '../data/options.js'
import { buildPool } from '../data/drill.js'
import { useDrill, ENGINES } from '../hooks/useDrill.js'
import { useTTS } from '../hooks/useTTS.js'
import { useSFX } from '../hooks/useSFX.js'
import VolumeOnIcon from '../icons/volume-on.svg?react'
import VolumeOffIcon from '../icons/volume-off.svg?react'

const PANEL_W = 420
const CHEVRON_W = 28
const PANEL_CONTENT_W = PANEL_W - CHEVRON_W

const BTN_FONT  = 13
const META_FONT = 11

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

function cardWordTypeKey(card) {
  const { wordType, group } = card.word
  if (wordType === 'verb') {
    if (group === 1) return 'u-verb'
    if (group === 2) return 'ru-verb'
    if (group === 3) return 'irregular'
  }
  if (wordType === 'adjective') {
    if (group === 'i') return 'i-adj'
    if (group === 'na') return 'na-adj'
  }
  if (wordType === 'noun') return 'noun'
  return null
}

function findSeekCard(newPool, currentCard, axis, value) {
  if (!newPool.length) return null

  function matchesAxis(card) {
    if (!axis) return true
    if (axis === 'form')     return card.formKey  === value
    if (axis === 'register') return card.register === value
    if (axis === 'tense')    return card.tense    === value
    if (axis === 'polarity') return card.polarity === value
    if (axis === 'wordType') return cardWordTypeKey(card) === value
    return true
  }

  function similarity(card) {
    if (!currentCard) return 0
    let s = 0
    if (card.word.id  === currentCard.word.id)  s += 8
    if (card.formKey  === currentCard.formKey)   s += 4
    if (card.register === currentCard.register)  s += 2
    if (card.tense    === currentCard.tense)     s += 2
    if (card.polarity === currentCard.polarity)  s += 2
    return s
  }

  const candidates = newPool.filter(matchesAxis)
  const source = candidates.length ? candidates : newPool
  let best = source[0], bestSim = similarity(source[0])
  for (let i = 1; i < source.length; i++) {
    const s = similarity(source[i])
    if (s > bestSim) { bestSim = s; best = source[i] }
  }
  return best
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function ActiveDrill({ drill, ttsEnabled, sfxEnabled, onPulse }) {
  const [flippedCardId, setFlippedCardId] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [exitDir, setExitDir] = useState(null)
  const [streakLost, setStreakLost] = useState(null)
  const { currentCard, streak, totalCorrect, totalWrong, remaining } = drill
  const isFlipped = flippedCardId === currentCard.id
  const tts = useTTS()

  const isFlippedRef = useRef(isFlipped)
  const transitioningRef = useRef(false)
  useEffect(() => { isFlippedRef.current = isFlipped }, [isFlipped])
  useEffect(() => { transitioningRef.current = transitioning }, [transitioning])
  const sfx = useSFX()

  const handleVerdictRef = useRef()
  handleVerdictRef.current = (isCorrect) => {
    if (transitioningRef.current) return
    const action = isCorrect ? drill.onCorrect : drill.onWrong
    if (sfxEnabled) sfx.play(isCorrect ? 'flip_card_correct' : 'flip_card_wrong')
    setTransitioning(true)
    setExitDir(isCorrect ? 'up' : 'down')
    onPulse(isCorrect ? 'correct' : 'wrong')
    if (!isCorrect && streak > 0) {
      setStreakLost('visible')
      setTimeout(() => setStreakLost('fading'), 250)
      setTimeout(() => setStreakLost(null), 400)
    }
    setTimeout(() => {
      action()
      setExitDir(null)
    }, 280)
    setTimeout(() => {
      setTransitioning(false)
      onPulse(null)
    }, 600)
  }

  useEffect(() => {
    if (isFlipped && ttsEnabled) {
      tts.speak(currentCard.conjugation)
    } else {
      tts.cancel()
    }
    return () => tts.cancel()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped, currentCard.id, ttsEnabled])

  function handleFlip(next) {
    if (sfxEnabled) sfx.play('flip_card')
    setFlippedCardId(next ? currentCard.id : null)
  }

  useEffect(() => {
    function onKey(e) {
      if (transitioningRef.current) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (sfxEnabled) sfx.play('flip_card')
        setFlippedCardId(prev => prev === currentCard.id ? null : currentCard.id)
      } else if (e.code === 'KeyZ' && isFlippedRef.current) {
        handleVerdictRef.current(false)
      } else if (e.code === 'KeyX' && isFlippedRef.current) {
        handleVerdictRef.current(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentCard.id, drill])

  const bgComponent    = currentCard.register === 'plain' ? PlainBg : null
  const registerLabel  = currentCard.register ? VARIANTS[currentCard.register]?.label ?? null : null

  let cardClass = ''
  if (exitDir === 'up') cardClass = 'card-exit-up'
  else if (exitDir === 'down') cardClass = 'card-exit-down'
  else if (transitioning) cardClass = 'card-entering'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {streak > 0 && !streakLost && (
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: "'DotGothic16', sans-serif", letterSpacing: '0.05em' }}>
            Current streak: {streak}
          </div>
        )}
        {streakLost && (
          <div style={{ color: '#f87171', fontSize: 16, fontWeight: 700, fontFamily: "'DotGothic16', sans-serif", opacity: streakLost === 'fading' ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            Streak lost
          </div>
        )}
      </div>

      <div key={currentCard.id} className={cardClass}>
        <ConjugationCard
          variant={currentCard.variant}
          word={currentCard.word.kanji}
          answer={currentCard.conjugation}
          negative={currentCard.polarity === 'negative'}
          past={currentCard.tense === 'past'}
          bgComponent={bgComponent}
          bgComponentColor={currentCard.bgColor}
          registerLabel={registerLabel}
          flipped={isFlipped}
          onFlip={handleFlip}
        />
      </div>

      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isFlipped ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleVerdictRef.current(false)}
              disabled={transitioning}
              className="verdict-btn"
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
              Wrong [Z]
            </button>
            <button
              onClick={() => handleVerdictRef.current(true)}
              disabled={transitioning}
              className="verdict-btn"
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
              Correct [X]
            </button>
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Click or Space to flip</div>
        )}
      </div>

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

const DEFAULTS = {
  wordTypes:  ['u-verb', 'ru-verb', 'irregular'],
  registers:  ['polite'],
  forms:      ['default'],
  tenses:     ['present'],
  polarities: ['positive'],
  engine:     'simpleQueue',
}

export default function DrillPage() {
  const [showOptions,        setShowOptions]        = useState(() => window.innerWidth > 768)
  const [selectedWordTypes,  setSelectedWordTypes]  = useState(DEFAULTS.wordTypes)
  const [selectedRegisters,  setSelectedRegisters]  = useState(DEFAULTS.registers)
  const [selectedForms,      setSelectedForms]      = useState(DEFAULTS.forms)
  const [selectedTenses,     setSelectedTenses]     = useState(DEFAULTS.tenses)
  const [selectedPolarities, setSelectedPolarities] = useState(DEFAULTS.polarities)
  const [selectedEngine,     setSelectedEngine]     = useState(DEFAULTS.engine)
  const [seekCardId,         setSeekCardId]         = useState(null)
  const [ttsEnabled,         setTtsEnabled]         = useState(() => {
    const stored = localStorage.getItem('tts-enabled')
    return stored === null ? true : stored === 'true'
  })
  const [sfxEnabled,         setSfxEnabled]         = useState(() => {
    const stored = localStorage.getItem('sfx-enabled')
    return stored === null ? true : stored === 'true'
  })
  const [pulseColor,         setPulseColor]         = useState(null)
  const isMobile = useIsMobile()

  useEffect(() => { localStorage.setItem('tts-enabled', ttsEnabled) }, [ttsEnabled])
  useEffect(() => { localStorage.setItem('sfx-enabled', sfxEnabled) }, [sfxEnabled])

  function seek(newWordTypes, newForms, newRegs, newTenses, newPols, axis, value) {
    const newPool = buildPool({
      selectedWordTypes:  newWordTypes,
      selectedForms:      newForms,
      selectedRegisters:  newRegs,
      selectedTenses:     newTenses,
      selectedPolarities: newPols,
    })
    setSeekCardId(findSeekCard(newPool, drill.currentCard, axis, value)?.id ?? null)
  }

  const verbSelected = ['u-verb', 'ru-verb', 'irregular'].some(k => selectedWordTypes.includes(k))
  const drillMode    = selectedWordTypes.length > 0

  const poolKey = [selectedWordTypes, selectedForms, selectedRegisters, selectedTenses, selectedPolarities]
    .map(a => [...a].sort().join(','))
    .join('|')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pool = useMemo(() => buildPool({ selectedWordTypes, selectedForms, selectedRegisters, selectedTenses, selectedPolarities }), [poolKey])

  const engine = ENGINES[selectedEngine]
  const drill  = useDrill(pool, { engine, seekCardId })

  const gridCols = 'repeat(2, 1fr)'
  const hairline = { height: 1, background: 'rgba(255,255,255,0.08)', margin: '20px 0' }
  const rowStyle = { display: 'flex', alignItems: 'center', gap: 10 }
  const rowLabelStyle = { width: 60, flexShrink: 0, color: 'rgba(255,255,255,0.4)', fontSize: META_FONT, letterSpacing: '0.08em', textTransform: 'uppercase' }

  function renderPanelContent(paddingH) {
    return (
      <div style={{ padding: `16px ${paddingH}px 24px` }}>

        {/* ── Section 1: Words ── */}
        <DrawerSectionHeader
          title="Words"
          hasSelections={selectedWordTypes.length > 0}
          onClearAll={() => { setSelectedWordTypes([]); setSeekCardId(null) }}
          fontSize={META_FONT}
        />
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 6 }}>
          {WORD_TYPES.map(({ key, line1, line2 }) => (
            <SelectButton
              key={key}
              selected={selectedWordTypes.includes(key)}
              centered
              minHeight={50}
              fontSize={BTN_FONT}
              onClick={() => {
                const next = toggle(selectedWordTypes, key)
                const adding = !selectedWordTypes.includes(key)
                seek(next, selectedForms, selectedRegisters, selectedTenses, selectedPolarities, adding ? 'wordType' : null, adding ? key : null)
                setSelectedWordTypes(next)
              }}
            >
              <span style={{ fontSize: 15 }}>{line1}</span>
              {line2 && <span style={{ fontSize: META_FONT, opacity: 0.8 }}>{line2}</span>}
            </SelectButton>
          ))}
        </div>
        <SelectionError visible={selectedWordTypes.length === 0} />

        {/* ── Separator ── */}
        <div style={hairline} />

        {/* ── Section 2: Polarity / Tense / Register ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Polarity */}
          <div>
            <div style={rowStyle}>
              <span style={rowLabelStyle}>Polarity</span>
              <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
                {POLARITIES.map(({ key, label, subtext }) => (
                  <SelectButton
                    key={key}
                    selected={selectedPolarities.includes(key)}
                    horizontal
                    fontSize={BTN_FONT}
                    subtext={subtext}
                    onClick={() => {
                      const next = toggle(selectedPolarities, key)
                      const adding = !selectedPolarities.includes(key)
                      seek(selectedWordTypes, selectedForms, selectedRegisters, selectedTenses, next, adding ? 'polarity' : null, adding ? key : null)
                      setSelectedPolarities(next)
                    }}
                  >
                    {label}
                  </SelectButton>
                ))}
              </div>
            </div>
            <SelectionError visible={selectedPolarities.length === 0} />
          </div>

          {/* Tense */}
          <div>
            <div style={rowStyle}>
              <span style={rowLabelStyle}>Tense</span>
              <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
                {TENSES.map(({ key, label, subtext }) => (
                  <SelectButton
                    key={key}
                    selected={selectedTenses.includes(key)}
                    horizontal
                    fontSize={BTN_FONT}
                    subtext={subtext}
                    onClick={() => {
                      const next = toggle(selectedTenses, key)
                      const adding = !selectedTenses.includes(key)
                      seek(selectedWordTypes, selectedForms, selectedRegisters, next, selectedPolarities, adding ? 'tense' : null, adding ? key : null)
                      setSelectedTenses(next)
                    }}
                  >
                    {label}
                  </SelectButton>
                ))}
              </div>
            </div>
            <SelectionError visible={selectedTenses.length === 0} />
          </div>

          {/* Register — only when verb types are selected */}
          {verbSelected && (
            <div>
              <div style={rowStyle}>
                <span style={rowLabelStyle}>Register</span>
                <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
                  {REGISTERS.map(({ key }) => (
                    <SelectButton
                      key={key}
                      selected={selectedRegisters.includes(key)}
                      horizontal
                      fontSize={BTN_FONT}
                      onClick={() => {
                        const next = toggle(selectedRegisters, key)
                        const adding = !selectedRegisters.includes(key)
                        seek(selectedWordTypes, selectedForms, next, selectedTenses, selectedPolarities, adding ? 'register' : null, adding ? key : null)
                        setSelectedRegisters(next)
                      }}
                    >
                      {VARIANTS[key].label}
                    </SelectButton>
                  ))}
                </div>
              </div>
              <SelectionError visible={selectedRegisters.length === 0} />
            </div>
          )}
        </div>

        {/* ── Separator + Section 3: Verb Forms ── */}
        {verbSelected && (
          <>
            <div style={hairline} />
            <DrawerSectionHeader
              title="Verb forms"
              hasSelections={selectedForms.length > 0}
              onClearAll={() => {
                seek(selectedWordTypes, [], selectedRegisters, selectedTenses, selectedPolarities, null, null)
                setSelectedForms([])
              }}
              fontSize={META_FONT}
            />
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 6 }}>
              {GRAMMAR_FORMS.map(({ key, label, bgColor, keyColor, subtext }) => (
                <SelectButton
                  key={key}
                  selected={selectedForms.includes(key)}
                  bgColor={bgColor}
                  borderColor={keyColor}
                  subtext={subtext}
                  fontSize={BTN_FONT}
                  onClick={() => {
                    const next = toggle(selectedForms, key)
                    const adding = !selectedForms.includes(key)
                    seek(selectedWordTypes, next, selectedRegisters, selectedTenses, selectedPolarities, adding ? 'form' : null, adding ? key : null)
                    setSelectedForms(next)
                  }}
                >
                  {label}
                </SelectButton>
              ))}
            </div>
            <SelectionError visible={selectedForms.length === 0} />
          </>
        )}


      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#2E2E2E',
      fontFamily: "'DotGothic16', system-ui, sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>

        {/* Verdict pulse — full-page background flash */}
        <div
          className={pulseColor ? `stage-pulse-${pulseColor}` : ''}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
        />

        {/* Header */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px', zIndex: 10,
        }}>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em' }}>Doushi Drill v0.1</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 }}>by Simon Callsen</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { setTtsEnabled(v => !v); setSfxEnabled(v => !v) }}
              title={ttsEnabled ? 'Mute audio' : 'Enable audio'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                cursor: 'pointer',
                opacity: ttsEnabled ? 1 : 0.35,
                padding: 0,
              }}
            >
              {ttsEnabled
                ? <VolumeOnIcon width={16} height={16} />
                : <VolumeOffIcon width={16} height={16} />
              }
            </button>
            <button
              onClick={() => setShowOptions(v => !v)}
              title={showOptions ? 'Hide options' : 'Show options'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 34,
                padding: '0 12px',
                fontSize: 13,
                fontFamily: 'inherit',
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {showOptions ? 'Hide options' : 'Show options'}
            </button>
          </div>
        </div>

        {/* Center */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          {!drillMode ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Open options to start drilling</div>
          ) : pool.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No cards match your selections</div>
          ) : drill.done ? (
            <DoneScreen totalCorrect={drill.totalCorrect} totalWrong={drill.totalWrong} onRestart={drill.restart} />
          ) : (
            <ActiveDrill drill={drill} ttsEnabled={ttsEnabled} sfxEnabled={sfxEnabled} onPulse={setPulseColor} />
          )}
        </div>
      </div>

      {/* ── Desktop options panel ── */}
      {!isMobile && (
        <>
          {/* Chevron — always visible, outside the collapsible panel */}
          <div
            onClick={() => setShowOptions(v => !v)}
            style={{
              flexShrink: 0,
              width: CHEVRON_W,
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              borderRight: showOptions ? '1px solid rgba(255,255,255,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <button
              style={{
                width: CHEVRON_W,
                height: 44,
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.35)',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              {showOptions ? '›' : '‹'}
            </button>
          </div>

          {/* Collapsible panel content */}
          <div style={{
            flexShrink: 0,
            width: showOptions ? PANEL_CONTENT_W : 0,
            overflow: 'hidden',
            transition: 'width 220ms ease',
          }}>
            <div style={{ width: PANEL_CONTENT_W, height: '100%', overflowY: 'auto' }}>
              {renderPanelContent(16)}
            </div>
          </div>
        </>
      )}

      {/* ── Mobile overlay ── */}
      {isMobile && showOptions && (
        <>
          <div
            onClick={() => setShowOptions(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 20,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 30,
              background: '#2E2E2E',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Options</div>
              <button
                onClick={() => setShowOptions(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}
              >
                Hide
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {renderPanelContent(20)}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
