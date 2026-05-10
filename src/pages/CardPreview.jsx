import { useState } from 'react'
import ConjugationCard from '../components/ConjugationCard/index.jsx'
import VARIANTS from '../components/ConjugationCard/variants.js'

export default function CardPreview() {
  const [variant, setVariant] = useState('plain')
  const [word, setWord] = useState('食べる')
  const [negative, setNegative] = useState(false)
  const [past, setPast] = useState(false)
  const [showControls, setShowControls] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DotGothic16', system-ui, sans-serif" }}>
      {/* Controls */}
      <div
        style={{
          width: showControls ? 240 : 0,
          overflow: 'hidden',
          borderRight: showControls ? '1px solid #ddd' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          background: '#fafafa',
          transition: 'width 200ms ease',
          flexShrink: 0,
        }}
      >
      <div style={{ width: 240, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Card controls</h2>

        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Variant</legend>
          {Object.keys(VARIANTS).map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="radio"
                name="variant"
                value={key}
                checked={variant === key}
                onChange={() => setVariant(key)}
              />
              {VARIANTS[key].label}
            </label>
          ))}
        </fieldset>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Word</label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={negative} onChange={(e) => setNegative(e.target.checked)} />
            Negative
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} />
            Past
          </label>
        </div>
      </div>
      </div>

      {/* Preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#2E2E2E',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px' }}>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em' }}>Doushi Drill v0.1</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 }}>by Simon Callsen</div>
          </div>
          <button
            onClick={() => setShowControls(v => !v)}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {showControls ? 'Hide options' : 'Show options'}
          </button>
        </div>

        {/* Card + hint */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <ConjugationCard variant={variant} word={word} negative={negative} past={past} />
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Click to flip card</div>
        </div>
      </div>
    </div>
  )
}
