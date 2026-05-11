export default function SelectButton({ selected, bgColor = '#ffffff', borderColor = '#aaaaaa', subtext, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? bgColor : 'transparent',
        color: selected ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.5)',
        border: selected ? `2px solid ${borderColor}` : '1px solid rgba(255,255,255,0.18)',
        borderRadius: 6,
        padding: selected ? '6px 11px' : '7px 12px',
        fontSize: 13,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 130ms, color 130ms',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <span>{children}</span>
      {subtext && (
        <span style={{ opacity: 0.65, fontSize: 11 }}>{subtext}</span>
      )}
    </button>
  )
}
