const labelStyle = {
  width: 60,
  flexShrink: 0,
  color: 'rgba(255,255,255,0.4)',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

function chipStyle(active) {
  return {
    padding: '4px 0',
    fontSize: 12,
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'center',
    borderRadius: 6,
    border: active ? '2px solid #aaaaaa' : '1px solid rgba(255,255,255,0.18)',
    background: active ? '#ffffff' : 'transparent',
    color: active ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.5)',
    transition: 'background 130ms, color 130ms, border-color 130ms',
  }
}

export default function ChipRow({ label, options, selected, axis, onChange }) {
  const allSelected = options.every(o => selected.includes(o.key))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, flex: 1 }}>
        <button style={chipStyle(allSelected)} onClick={() => onChange(options.map(o => o.key), null, null)}>
          All
        </button>
        {options.map(({ key, label: optLabel }) => (
          <button
            key={key}
            style={chipStyle(selected.length === 1 && selected[0] === key)}
            onClick={() => onChange([key], axis, key)}
          >
            {optLabel}
          </button>
        ))}
      </div>
    </div>
  )
}
