export default function DrawerCheckbox({ checked, onChange, label, indent = 0 }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: indent * 14,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 14,
        height: 14,
        flexShrink: 0,
        border: checked ? 'none' : '1px solid rgba(255,255,255,0.35)',
        borderRadius: 3,
        background: checked ? 'rgba(255,255,255,0.85)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 130ms',
      }}>
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3L3.5 5.5L8 1" stroke="#2E2E2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'inherit' }}>
        {label}
      </span>
    </div>
  )
}
