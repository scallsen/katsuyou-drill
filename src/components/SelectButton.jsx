export default function SelectButton({ selected, bgColor = '#ffffff', borderColor = 'rgba(0,0,0,0.25)', subtext, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? bgColor : '#9E9E9E',
        color: selected ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.65)',
        border: selected ? `2px solid ${borderColor}` : '2px solid transparent',
        borderRadius: 6,
        padding: '7px 14px',
        fontSize: 13,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 130ms, color 130ms',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <span style={{ textAlign: 'left' }}>{children}</span>
      {subtext && (
        <span style={{ opacity: 0.5, fontSize: 12, flexShrink: 0 }}>{subtext}</span>
      )}
    </button>
  )
}
