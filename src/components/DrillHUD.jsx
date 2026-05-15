import { useState, useEffect, useRef } from 'react'

const KEYFRAMES_ID     = 'streak-keyframes'
const WIGGLE_THRESHOLD = 10
const WAVE_THRESHOLD   = 20

function streakFontSize(n) {
  return 20 + Math.min(n, 12)
}

function WaveText({ text, color }) {
  return text.split('').map((char, i) => (
    <span
      key={i}
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        color,
        animation: `streak-wave 0.8s ease-in-out infinite`,
        animationDelay: `${-(i * 0.08)}s`,
      }}
    >
      {char}
    </span>
  ))
}

export default function DrillHUD({ streak, bestStreak, totalCorrect, totalWrong, canUndo, onUndo, showStreak, showVisualEffects = true, onboardingHint, children }) {
  const [streakLost, setStreakLost] = useState(null)
  const [popCount,   setPopCount]   = useState(0)
  const prevStreakRef = useRef(streak)

  useEffect(() => {
    if (!document.getElementById(KEYFRAMES_ID)) {
      const style = document.createElement('style')
      style.id = KEYFRAMES_ID
      style.textContent = [
        '@keyframes streak-pop     { 0% { transform: scale(1) } 40% { transform: scale(1.18) } 100% { transform: scale(1) } }',
        '@keyframes streak-wiggle  { 0%, 100% { transform: rotate(-0.8deg) } 50% { transform: rotate(0.8deg) } }',
        '@keyframes streak-wave    { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }',
      ].join(' ')
      document.head.appendChild(style)
    }
    return () => document.getElementById(KEYFRAMES_ID)?.remove()
  }, [])

  useEffect(() => {
    const prev = prevStreakRef.current
    if (prev > 0 && streak === 0) {
      setStreakLost('visible')
      const t1 = setTimeout(() => setStreakLost('fading'), 250)
      const t2 = setTimeout(() => setStreakLost(null), 400)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    prevStreakRef.current = streak
    if (streak > prev) {
      setPopCount(c => c + 1)
    }
  }, [streak])

  const ghostBtn = (available, onClick, label) => (
    <button
      onClick={available ? onClick : undefined}
      style={{
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        cursor: available ? 'pointer' : 'default',
        fontFamily: 'inherit',
        padding: 0,
        opacity: available ? 1 : 0.25,
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </button>
  )

  const atBest   = streak > 0 && streak === bestStreak
  const subLabel = bestStreak === 0 ? null : atBest ? 'BEST STREAK' : `Best streak: ${bestStreak}`

  const showWiggle  = showVisualEffects && streak >= WIGGLE_THRESHOLD
  const showWave    = showVisualEffects && streak >= WAVE_THRESHOLD
  const streakText  = streak > 0 ? `Streak: ${streak}` : 'Streak: 0'
  const streakColor = streak > 0 ? '#fff' : 'transparent'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>

      <div style={{ height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, visibility: (showStreak || onboardingHint != null) ? 'visible' : 'hidden' }}>
        {onboardingHint != null ? (
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DotGothic16', sans-serif", color: '#fff', letterSpacing: '0.05em', lineHeight: 1.3, textAlign: 'center', maxWidth: 'calc(100vw - 48px)', whiteSpace: 'pre-line' }}>
            {onboardingHint}
          </span>
        ) : streakLost ? (
          <span style={{ color: '#f87171', fontSize: 16, fontWeight: 700, fontFamily: "'DotGothic16', sans-serif", opacity: streakLost === 'fading' ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            Streak lost
          </span>
        ) : (
          <>
            <span style={{
              display: 'inline-block',
              fontSize: streakFontSize(streak),
              transition: showVisualEffects ? 'font-size 0.35s ease' : 'none',
              fontWeight: 700,
              fontFamily: "'DotGothic16', sans-serif",
              letterSpacing: '0.05em',
              lineHeight: 1,
              animation: showWiggle ? 'streak-wiggle 1.4s ease-in-out infinite' : 'none',
            }}>
              <span
                key={popCount}
                style={{
                  display: 'inline-block',
                  userSelect: 'none',
                  animation: showVisualEffects && popCount > 0 ? 'streak-pop 0.18s ease-out' : 'none',
                }}
              >
                {showWave
                  ? <WaveText text={streakText} color={streakColor} />
                  : <span style={{ color: streakColor }}>{streakText}</span>
                }
              </span>
            </span>
            <span style={{ color: subLabel ? 'rgba(255,255,255,0.3)' : 'transparent', fontSize: 12, fontFamily: "'DotGothic16', sans-serif", userSelect: 'none', lineHeight: 1 }}>
              {subLabel ?? 'Best streak: 0'}
            </span>
          </>
        )}
      </div>

      <div>{children}</div>

      <div style={{ width: 'min(380px, calc(100vw - 32px))', visibility: canUndo ? 'visible' : 'hidden', marginTop: -5 }}>
        <button
          onClick={onUndo}
          className="undo-btn"
          style={{
            width: '100%',
            padding: '10px 0',
            background: 'none',
            border: 'none',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.45)',
            fontSize: 14,
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
            cursor: 'pointer',
          }}
        >
          Undo
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: "'DotGothic16', sans-serif", alignItems: 'center', visibility: showStreak && (totalCorrect > 0 || totalWrong > 0) ? 'visible' : 'hidden' }}>
        <span>{totalCorrect} correct</span>
        <span>{totalWrong} wrong</span>
      </div>

    </div>
  )
}
