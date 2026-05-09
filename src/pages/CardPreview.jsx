import { useState } from 'react'
import ConjugationCard from '../components/ConjugationCard/index.jsx'
import VARIANTS from '../components/ConjugationCard/variants.js'

export default function CardPreview() {
  const [variant, setVariant] = useState('plain')
  const [word, setWord] = useState('食べる')
  const [negative, setNegative] = useState(false)
  const [past, setPast] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Controls */}
      <div
        style={{
          width: 240,
          padding: 24,
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          background: '#fafafa',
        }}
      >
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

      {/* Preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
        }}
      >
        <ConjugationCard variant={variant} word={word} negative={negative} past={past} />
      </div>
    </div>
  )
}
