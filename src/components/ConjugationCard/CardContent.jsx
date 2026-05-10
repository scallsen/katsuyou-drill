import StampNegative from './stamps/stamp-negative.svg?react'
import StampPast from './stamps/stamp-past.svg?react'

export default function CardContent({ label, n, past, word, isAnswer = false }) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Answer label */}
      {isAnswer && (
        <div style={{ position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', fontFamily: "'DotGothic16', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>
          Answer
        </div>
      )}

      {/* Stamps — absolutely positioned, out of flow */}
      {n && (
        <div style={{ position: 'absolute', top: 12, left: 5, pointerEvents: 'none', transform: 'rotate(-8deg)' }}>
          <StampNegative width={222} height={64} />
        </div>
      )}
      {past && (
        <div style={{ position: 'absolute', bottom: 12, right: 5, pointerEvents: 'none', transform: 'rotate(6deg)' }}>
          <StampPast width={171} height={64} />
        </div>
      )}

      {/* Word + label */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '0 16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'DotGothic16', sans-serif",
            fontSize: 48,
            fontWeight: 400,
            color: '#222',
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            textShadow: '2px 2px 0 rgba(0,0,0,0.25)',
          }}
        >
          {word}
        </div>
        <div
          style={{
            fontFamily: "'DotGothic16', sans-serif",
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: '#666',
            textShadow: '2px 2px 0 rgba(0,0,0,0.15)',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
