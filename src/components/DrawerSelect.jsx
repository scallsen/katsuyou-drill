const srOnly = {
  position: 'absolute', width: 1, height: 1, padding: 0,
  margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
}

export default function DrawerSelect({ value, onChange, options, indent = 0, label, subtext }) {
  const id = label ? `drawer-select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined
  return (
    <div style={{ paddingLeft: indent * 14 + 22, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label htmlFor={id} style={srOnly}>{label}</label>
      )}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 6,
          color: 'rgba(255,255,255,0.65)',
          fontSize: 13,
          fontFamily: 'inherit',
          padding: '6px 28px 6px 10px',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255%2C255%2C255%2C0.4)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#2E2E2E', color: '#fff' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {subtext && (
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'inherit' }}>
          {subtext}
        </span>
      )}
    </div>
  )
}
