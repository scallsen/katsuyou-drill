import { useState, useMemo, useEffect, useRef } from 'react'
import ConjugationCard from '../components/ConjugationCard/index.jsx'
import VARIANTS from '../components/ConjugationCard/variants.js'
import PlainBg from '../components/ConjugationCard/backgrounds/PlainBg.jsx'
import DrillHUD from '../components/DrillHUD.jsx'
import SelectButton from '../components/SelectButton.jsx'
import DrawerSectionHeader from '../components/DrawerSectionHeader.jsx'
import SelectionError from '../components/SelectionError.jsx'
import { WORD_TYPES, REGISTERS, GRAMMAR_FORMS, TENSES, POLARITIES } from '../data/options.js'
import { buildPool } from '../data/drill.js'
import { useDrill, ENGINES } from '../hooks/useDrill.js'
import { useTTS, useJaVoices } from '../hooks/useTTS.js'
import { useSFX } from '../hooks/useSFX.js'
import ChipRow from '../components/ChipRow.jsx'
import DrawerCheckbox from '../components/DrawerCheckbox.jsx'
import DrawerSelect from '../components/DrawerSelect.jsx'
import VolumeOnIcon from '../icons/volume-on.svg?react'
import VolumeOffIcon from '../icons/volume-off.svg?react'
import logoMain from '../icons/logo-main.png'
import Wordmark from '../icons/wordmark.svg?react'

const PANEL_W = 420
const CHEVRON_W = 28
const PANEL_CONTENT_W = PANEL_W - CHEVRON_W

const BTN_FONT  = 13
const META_FONT = 13

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

function ActiveDrill({ drill, ttsEnabled, sfxEnabled, ttsVoice, showStreak, showFurigana, pixelFont, showVisualEffects, onPulse, onFirstVerdict }) {
  const [flippedCardId, setFlippedCardId] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [exitDir, setExitDir] = useState(null)
  const [undoEntering, setUndoEntering] = useState(false)
  const { currentCard, streak, bestStreak, totalCorrect, totalWrong, remaining, canUndo, prevCard, onUndo } = drill
  const isFlipped = flippedCardId === currentCard.id
  const tts = useTTS(ttsVoice)

  // Optimistic streak — updates immediately on button press, syncs after engine resolves
  const [localStreak,     setLocalStreak]     = useState(streak)
  const [localBestStreak, setLocalBestStreak] = useState(bestStreak)
  useEffect(() => { setLocalStreak(streak) },     [streak])
  useEffect(() => { setLocalBestStreak(bestStreak) }, [bestStreak])

  const isFlippedRef = useRef(isFlipped)
  const transitioningRef = useRef(false)
  const localStreakRef = useRef(localStreak)
  useEffect(() => { isFlippedRef.current = isFlipped }, [isFlipped])
  useEffect(() => { transitioningRef.current = transitioning }, [transitioning])
  useEffect(() => { localStreakRef.current = localStreak }, [localStreak])
  const sfx = useSFX()

  const [showHint]        = useState(true)
  const [hintPhase,        setHintPhase]        = useState('pre-flip')
  const [displayedHint,    setDisplayedHint]    = useState('')
  const typewriterTimer = useRef(null)

  function runTypewriter(text, msPerChar) {
    clearInterval(typewriterTimer.current)
    setDisplayedHint('')
    let i = 0
    typewriterTimer.current = setInterval(() => {
      i++
      setDisplayedHint(text.slice(0, i))
      if (i >= text.length) clearInterval(typewriterTimer.current)
    }, msPerChar)
  }

  useEffect(() => {
    if (!showHint) return
    runTypewriter('Conjugate the verb below,\nthen flip to check.', 55)
    return () => clearInterval(typewriterTimer.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showHint || hintPhase !== 'pre-flip' || !isFlipped) return
    setHintPhase('post-flip')
    runTypewriter('Did you get it right?\nMark your answer.', 55)
  }, [isFlipped]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerdictRef = useRef()
  handleVerdictRef.current = (isCorrect) => {
    if (transitioningRef.current) return
    if (showHint && hintPhase !== 'done') {
      setHintPhase('done')
      clearInterval(typewriterTimer.current)
      setDisplayedHint('')
      onFirstVerdict?.()
    }
    const action = isCorrect ? drill.onCorrect : drill.onWrong
    const breaksBest = !isCorrect && localStreak > 0 && localStreak === localBestStreak
    if (sfxEnabled) sfx.play(
      isCorrect ? 'flip_card_correct' : breaksBest ? 'best_streak_broken' : 'flip_card_wrong',
      isCorrect ? { pitchFactor: 1 + Math.min(localStreak + 1, 20) * 0.03 } : {}
    )
    if (isCorrect) {
      const next = localStreak + 1
      setLocalStreak(next)
      setLocalBestStreak(prev => Math.max(prev, next))
    } else {
      setLocalStreak(0)
    }
    setTransitioning(true)
    setExitDir(isCorrect ? 'up' : 'down')
    onPulse(isCorrect ? 'correct' : 'wrong')
    const exitDelay  = showVisualEffects ? 280 : 0
    const clearDelay = showVisualEffects ? 600 : 0
    setTimeout(() => {
      action()
      setExitDir(null)
    }, exitDelay)
    setTimeout(() => {
      setTransitioning(false)
      onPulse(null)
    }, clearDelay)
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

  function handleUndo() {
    if (transitioningRef.current || !canUndo) return
    if (sfxEnabled) sfx.play('undo')
    setFlippedCardId(null)
    setTransitioning(true)
    setExitDir('undo')
    const undoExitDelay  = showVisualEffects ? 200 : 0
    const undoClearDelay = showVisualEffects ? 580 : 0
    setTimeout(() => {
      onUndo()
      setExitDir(null)
      setUndoEntering(true)
    }, undoExitDelay)
    setTimeout(() => {
      setTransitioning(false)
      setUndoEntering(false)
    }, undoClearDelay)
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

  const bgComponent   = currentCard.register === 'plain' ? PlainBg : null
  const registerLabel = currentCard.register ? VARIANTS[currentCard.register]?.label ?? null : null

  let cardClass = ''
  if (showVisualEffects) {
    if (exitDir === 'up') cardClass = 'card-exit-up'
    else if (exitDir === 'down') cardClass = 'card-exit-down'
    else if (exitDir === 'undo') cardClass = 'card-exit-undo'
    else if (undoEntering) cardClass = 'card-entering-undo'
    else if (transitioning) cardClass = 'card-entering'
  }

  return (
    <DrillHUD
      streak={localStreak}
      bestStreak={localBestStreak}
      totalCorrect={totalCorrect}
      totalWrong={totalWrong}
      canUndo={canUndo}
      onUndo={handleUndo}
      showStreak={showStreak}
      showVisualEffects={showVisualEffects}
      onboardingHint={showHint && hintPhase !== 'done' ? displayedHint : null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
        <div key={currentCard.id} className={cardClass}>
          <ConjugationCard
            variant={currentCard.variant}
            word={currentCard.word.kanji}
            kana={currentCard.word.kana}
            showFurigana={showFurigana}
            pixelFont={pixelFont}
            answer={currentCard.conjugation}
            negative={currentCard.polarity === 'negative'}
            past={currentCard.tense === 'past'}
            bgComponent={bgComponent}
            bgComponentColor={currentCard.bgColor}
            registerLabel={registerLabel}
            flipped={isFlipped}
            onFlip={handleFlip}
            animate={showVisualEffects}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ height: 52, width: 'min(380px, calc(100vw - 32px))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isFlipped ? (
              <div style={{ display: 'flex', width: '100%', gap: 12 }}>
                <button
                  onClick={() => handleVerdictRef.current(false)}
                  disabled={transitioning}
                  className="verdict-btn"
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    background: 'rgba(192, 57, 43, 0.85)',
                    color: '#fff',
                    border: 'none',
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
                    flex: 1,
                    padding: '10px 0',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    background: 'rgba(39, 174, 96, 0.85)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                  }}
                >
                  Correct [X]
                </button>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{navigator.maxTouchPoints > 0 ? 'Tap card to flip' : 'Click card or press spacebar to flip'}</div>
            )}
          </div>
        </div>
      </div>
    </DrillHUD>
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
  const [audioEnabled,       setAudioEnabled]       = useState(() => {
    const stored = localStorage.getItem('audio-enabled')
    return stored === null ? true : stored === 'true'
  })
  const [ttsEnabled,         setTtsEnabled]         = useState(() => {
    const stored = localStorage.getItem('tts-enabled')
    return stored === null ? true : stored === 'true'
  })
  const [sfxEnabled,         setSfxEnabled]         = useState(() => {
    const stored = localStorage.getItem('sfx-enabled')
    return stored === null ? true : stored === 'true'
  })
  const [ttsVoice,           setTtsVoice]           = useState(() => localStorage.getItem('tts-voice') ?? '')
  const [showStreak,         setShowStreak]         = useState(() => {
    const stored = localStorage.getItem('hud-show-stats')
    return stored === null ? true : stored === 'true'
  })
  const [showFurigana,       setShowFurigana]       = useState(() => {
    const stored = localStorage.getItem('show-furigana')
    return stored === null ? false : stored === 'true'
  })
  const [showVisualEffects,  setShowVisualEffects]  = useState(() => {
    const stored = localStorage.getItem('show-visual-effects')
    return stored === null ? true : stored === 'true'
  })
  const [pixelFont,          setPixelFont]          = useState(() => {
    const stored = localStorage.getItem('pixel-font')
    return stored === null ? true : stored === 'true'
  })
  const [pulseColor,         setPulseColor]         = useState(null)
  const [audioHovered,       setAudioHovered]       = useState(false)
  const [optionsHovered,     setOptionsHovered]     = useState(false)
  const [chevronHovered,     setChevronHovered]     = useState(false)
  const [showMobileMenuHint, setShowMobileMenuHint] = useState(false)
  const isMobile = useIsMobile()
  const jaVoices = useJaVoices()

  useEffect(() => { localStorage.setItem('audio-enabled', audioEnabled) }, [audioEnabled])
  useEffect(() => { localStorage.setItem('tts-enabled', ttsEnabled) }, [ttsEnabled])
  useEffect(() => { localStorage.setItem('sfx-enabled', sfxEnabled) }, [sfxEnabled])
  useEffect(() => { localStorage.setItem('tts-voice', ttsVoice) }, [ttsVoice])
  useEffect(() => { localStorage.setItem('hud-show-stats', showStreak) }, [showStreak])
  useEffect(() => { localStorage.setItem('show-furigana', showFurigana) }, [showFurigana])
  useEffect(() => { localStorage.setItem('show-visual-effects', showVisualEffects) }, [showVisualEffects])
  useEffect(() => { localStorage.setItem('pixel-font', pixelFont) }, [pixelFont])

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

  function handleFirstVerdict() {
    if (!isMobile) return
    if (localStorage.getItem('menu-hint-shown') === 'true') return
    if (showOptions) return
    localStorage.setItem('menu-hint-shown', 'true')
    setShowMobileMenuHint(true)
    setTimeout(() => setShowMobileMenuHint(false), 6000)
  }

  useEffect(() => {
    if (showOptions) setShowMobileMenuHint(false)
  }, [showOptions])

  const verbSelected     = ['u-verb', 'ru-verb', 'irregular'].some(k => selectedWordTypes.includes(k))
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
              <span style={{ fontSize: BTN_FONT }}>{line1}</span>
              {line2 && <span style={{ fontSize: BTN_FONT, opacity: 0.8 }}>{line2}</span>}
            </SelectButton>
          ))}
        </div>
        <SelectionError visible={selectedWordTypes.length === 0} />

        {/* ── Separator ── */}
        <div style={hairline} />

        {/* ── Section 2: Polarity / Tense / Register ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChipRow
            label="Polarity"
            options={POLARITIES}
            selected={selectedPolarities}
            axis="polarity"
            onChange={(newSel, axis, val) => {
              seek(selectedWordTypes, selectedForms, selectedRegisters, selectedTenses, newSel, axis, val)
              setSelectedPolarities(newSel)
            }}
          />
          <ChipRow
            label="Tense"
            options={TENSES}
            selected={selectedTenses}
            axis="tense"
            onChange={(newSel, axis, val) => {
              seek(selectedWordTypes, selectedForms, selectedRegisters, newSel, selectedPolarities, axis, val)
              setSelectedTenses(newSel)
            }}
          />
          <ChipRow
            label="Register"
            options={REGISTERS.map(({ key }) => ({ key, label: VARIANTS[key].label }))}
            selected={selectedRegisters}
            axis="register"
            onChange={(newSel, axis, val) => {
              seek(selectedWordTypes, selectedForms, newSel, selectedTenses, selectedPolarities, axis, val)
              setSelectedRegisters(newSel)
            }}
          />
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

        {/* ── Separator + Section: Additional Settings ── */}
        <div style={hairline} />
        <DrawerSectionHeader title="Additional Settings" fontSize={META_FONT} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DrawerCheckbox
            checked={showStreak}
            onChange={() => setShowStreak(v => !v)}
            label="Show streak"
          />
          <DrawerCheckbox
            checked={showFurigana}
            onChange={() => setShowFurigana(v => !v)}
            label="Show furigana"
          />
          <DrawerCheckbox
            checked={showVisualEffects}
            onChange={() => setShowVisualEffects(v => !v)}
            label="Show visual effects"
          />
          <DrawerCheckbox
            checked={pixelFont}
            onChange={() => setPixelFont(v => !v)}
            label="Use pixel font"
          />
          <DrawerCheckbox
            checked={audioEnabled}
            onChange={() => setAudioEnabled(v => !v)}
            label="Enable audio"
          />
          {audioEnabled && (
            <>
              <DrawerCheckbox
                checked={ttsEnabled}
                onChange={() => setTtsEnabled(v => !v)}
                label="Text to speech"
                indent={1}
              />
              {ttsEnabled && jaVoices.length > 0 && (
                <DrawerSelect
                  value={ttsVoice}
                  onChange={setTtsVoice}
                  options={[{ value: '', label: 'Default' }, ...jaVoices.map(v => ({ value: v.name, label: v.name }))]}
                  indent={2}
                />
              )}
              <DrawerCheckbox
                checked={sfxEnabled}
                onChange={() => setSfxEnabled(v => !v)}
                label="Sound effects"
                subtext="Silent mode may mute sound effects"
                indent={1}
              />
            </>
          )}
        </div>

      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      position: 'relative',
      width: '100vw',
      height: '100dvh',
      background: '#1E1E1E',
      fontFamily: "'DotGothic16', system-ui, sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>

        {/* Verdict pulse — full-page background flash */}
        <div
          className={showVisualEffects && pulseColor ? `stage-pulse-${pulseColor}` : ''}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
        />

        {/* Header */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logoMain} alt="" style={{ height: 32, display: 'block' }} />
            <Wordmark height={17} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setAudioEnabled(v => !v)}
              onMouseEnter={() => setAudioHovered(true)}
              onMouseLeave={() => setAudioHovered(false)}
              title={audioEnabled ? 'Mute audio' : 'Enable audio'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                background: audioHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                cursor: 'pointer',
                opacity: audioEnabled ? 1 : 0.35,
                padding: 0,
                transition: 'background 130ms',
              }}
            >
              {audioEnabled
                ? <VolumeOnIcon width={16} height={16} />
                : <VolumeOffIcon width={16} height={16} />
              }
            </button>
            <button
              onClick={() => setShowOptions(v => !v)}
              onMouseEnter={() => setOptionsHovered(true)}
              onMouseLeave={() => setOptionsHovered(false)}
              title={showOptions ? 'Hide options' : 'Show options'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 34,
                padding: '0 12px',
                fontSize: 13,
                fontFamily: 'inherit',
                background: optionsHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 130ms',
              }}
            >
              {showOptions ? 'Hide options' : 'Show options'}
            </button>
          </div>
        </div>

        {/* Mobile menu hint */}
        {showMobileMenuHint && (
          <div style={{
            position: 'absolute', top: 74, right: 24,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            fontFamily: 'inherit',
            letterSpacing: '0.04em',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            Tap to explore conjugations ↑
          </div>
        )}

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
            <ActiveDrill drill={drill} ttsEnabled={audioEnabled && ttsEnabled} sfxEnabled={audioEnabled && sfxEnabled} ttsVoice={ttsVoice} showStreak={showStreak} showFurigana={showFurigana} pixelFont={pixelFont} showVisualEffects={showVisualEffects} onPulse={setPulseColor} onFirstVerdict={handleFirstVerdict} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          padding: '12px 24px',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <a
            href="https://scallsen.ca"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textDecoration: 'none', pointerEvents: 'auto' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            Developed by Simon Callsen
          </a>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>·</span>
          <a
            href="https://github.com/scallsen/katsuyou-drill"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textDecoration: 'none', pointerEvents: 'auto' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            GitHub
          </a>
        </div>
      </div>

      {/* ── Desktop options panel ── */}
      {!isMobile && (
        <>
          {/* Chevron — always visible, outside the collapsible panel */}
          <div
            onClick={() => setShowOptions(v => !v)}
            onMouseEnter={() => setChevronHovered(true)}
            onMouseLeave={() => setChevronHovered(false)}
            style={{
              flexShrink: 0,
              width: CHEVRON_W,
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              borderRight: showOptions ? '1px solid rgba(255,255,255,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: chevronHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
              transition: 'background 130ms',
            }}>
            <button
              style={{
                width: CHEVRON_W,
                height: 44,
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
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
            <div className="sidebar-scroll" style={{ width: PANEL_CONTENT_W, height: '100%', overflowY: 'auto' }}>
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
            <div className="sidebar-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
              {renderPanelContent(20)}
            </div>
          </div>
        </>
      )}


    </div>
  )
}
