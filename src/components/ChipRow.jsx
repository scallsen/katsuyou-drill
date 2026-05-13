import { useState } from 'react'

const labelStyle = {
  width: 60,
  flexShrink: 0,
  color: 'rgba(255,255,255,0.4)',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

function chipStyle(active, hovered) {
  return {
    padding: '4px 0',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'center',
    borderRadius: 6,
    border: active ? '2px solid #aaaaaa' : '1px solid rgba(255,255,255,0.18)',
    background: active ? '#ffffff' : hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
    color: active ? 'rgba(0,0,0,0.85)' : hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
    transition: 'background 130ms, color 130ms, border-color 130ms',
  }
}

function Chip({ active, onClick, children }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      style={chipStyle(active, hovered)}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}

export default function ChipRow({ label, options, selected, axis, onChange }) {
  const allSelected = options.every(o => selected.includes(o.key))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, flex: 1 }}>
        <Chip active={allSelected} onClick={() => onChange(options.map(o => o.key), null, null)}>
          All
        </Chip>
        {options.map(({ key, label: optLabel }) => (
          <Chip
            key={key}
            active={selected.length === 1 && selected[0] === key}
            onClick={() => onChange([key], axis, key)}
          >
            {optLabel}
          </Chip>
        ))}
      </div>
    </div>
  )
}
