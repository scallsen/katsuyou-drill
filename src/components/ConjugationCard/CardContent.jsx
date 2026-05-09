const stampBase = {
  position: 'absolute',
  padding: '3px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  border: '2px solid',
  lineHeight: 1.5,
  pointerEvents: 'none',
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
      {/* Stamps — absolutely positioned, out of flow */}
      {n && (
        <span style={{ ...stampBase, top: 14, left: 14, color: '#c0392b', borderColor: '#c0392b', transform: 'rotate(-8deg)' }}>
          Negative
        </span>
      )}
      {past && (
        <span style={{ ...stampBase, bottom: 14, right: 14, color: '#2471a3', borderColor: '#2471a3', transform: 'rotate(6deg)' }}>
          Past
        </span>
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
            fontSize: 48,
            fontWeight: 700,
            color: '#222',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {word}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: '#666',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
