const stampStyle = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: '2px solid',
  lineHeight: 1.5,
}

export default function CardContent({ label, n, past, word }) {
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
      {/* Label strip */}
      <div
        style={{
          width: '100%',
          padding: '8px 14px',
          background: 'rgba(0,0,0,0.08)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: '#333',
          boxSizing: 'border-box',
        }}
      >
        {label}
      </div>

      {/* Stamp badges */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {n && (
          <span style={{ ...stampStyle, color: '#c0392b', borderColor: '#c0392b' }}>
            Negative
          </span>
        )}
        {past && (
          <span style={{ ...stampStyle, color: '#2471a3', borderColor: '#2471a3' }}>
            Past
          </span>
        )}
      </div>

      {/* Word */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          fontWeight: 700,
          color: '#222',
          letterSpacing: '-0.02em',
          padding: '0 16px',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {word}
      </div>
    </div>
  )
}
