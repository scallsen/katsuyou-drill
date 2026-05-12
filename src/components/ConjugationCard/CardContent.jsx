import { getTextColor } from '../../utils/color.js'
import { buildFurigana } from '../../utils/furigana.js'

export default function CardContent({ label, n, past, word, kana = null, showFurigana = false, answerLabel = null, answerBg = null }) {
  const textColor = answerBg ? getTextColor(answerBg) : null
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
      {answerLabel && (
        <div style={{ position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', fontFamily: "'DotGothic16', sans-serif", fontSize: 24, letterSpacing: '0.1em', textTransform: 'uppercase', color: textColor === '#ffffff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)' }}>
          {answerLabel}
        </div>
      )}

      {n && (
        <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: "'DotGothic16', sans-serif", fontSize: 24, letterSpacing: '0.1em', textTransform: 'uppercase', color: textColor ?? '#222', pointerEvents: 'none' }}>
          Negative
        </div>
      )}
      {past && (
        <div style={{ position: 'absolute', bottom: 12, left: 20, fontFamily: "'DotGothic16', sans-serif", fontSize: 24, letterSpacing: '0.1em', textTransform: 'uppercase', color: textColor ?? '#222', pointerEvents: 'none' }}>
          Past
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
            color: textColor ?? '#222',
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            textShadow: '2px 2px 0 rgba(0,0,0,0.25)',
          }}
        >
          {showFurigana && kana ? (() => {
            const f = buildFurigana(word, kana)
            if (!f) return word
            return (
              <span>
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <span style={{
                    position: 'absolute',
                    bottom: '100%',
                    marginBottom: 2,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontSize: '0.45em',
                    fontFamily: "'DotGothic16', sans-serif",
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>
                    {f.furigana}
                  </span>
                  {f.kanjiPart}
                </span>
                {f.okurigana}
              </span>
            )
          })() : word}
        </div>
        <div
          style={{
            fontFamily: "'DotGothic16', sans-serif",
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: textColor ?? '#222',
            textShadow: '2px 2px 0 rgba(0,0,0,0.15)',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
