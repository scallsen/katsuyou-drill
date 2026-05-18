import { buildFurigana, buildFuriganaForConjugation } from '../../utils/furigana.js'

export default function CardContent({ label, n, past, word, kana = null, wordKanji = null, showFurigana = false, pixelFont = true, answerLabel = null, translation = null }) {
  const jaFont = pixelFont ? "'DotGothic16', sans-serif" : "system-ui, sans-serif"
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
        <div style={{ position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', fontFamily: "'DotGothic16', sans-serif", fontSize: '6.32cqw', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)' }}>
          {answerLabel}
        </div>
      )}

      {n && (
        <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: "'DotGothic16', sans-serif", fontSize: '6.32cqw', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#222', pointerEvents: 'none' }}>
          Negative
        </div>
      )}
      {past && (
        <div style={{ position: 'absolute', bottom: 12, left: 20, fontFamily: "'DotGothic16', sans-serif", fontSize: '6.32cqw', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#222', pointerEvents: 'none' }}>
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
            fontFamily: jaFont,
            fontSize: '12.63cqw',
            fontWeight: 400,
            color: '#222',
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            textShadow: '2px 2px 0 rgba(0,0,0,0.25)',
          }}
        >
          {showFurigana && kana ? (() => {
            const f = wordKanji
              ? buildFuriganaForConjugation(word, wordKanji, kana)
              : buildFurigana(word, kana)
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
                    fontFamily: jaFont,
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
            fontSize: '6.84cqw',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: '#222',
            textShadow: '2px 2px 0 rgba(0,0,0,0.15)',
          }}
        >
          {label}
        </div>
        {translation && (
          <div
            style={{
              fontFamily: "'DotGothic16', sans-serif",
              fontSize: '5.26cqw',
              fontWeight: 400,
              letterSpacing: '0.04em',
              color: 'rgba(0,0,0,0.42)',
            }}
          >
            {translation}
          </div>
        )}
      </div>
    </div>
  )
}
