export default function SelectButton({ selected, bgColor = '#ffffff', borderColor = '#aaaaaa', subtext, onClick, children, centered, minHeight, horizontal, fontSize = 13 }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? bgColor : 'transparent',
        color: selected ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.5)',
        border: selected ? `2px solid ${borderColor}` : '1px solid rgba(255,255,255,0.18)',
        borderRadius: 6,
        padding: selected
          ? (horizontal ? '9px 11px' : '6px 11px')
          : (horizontal ? '10px 12px' : '7px 12px'),
        fontSize,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 130ms, color 130ms',
        width: '100%',
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        alignItems: horizontal ? 'center' : (centered ? 'center' : 'flex-start'),
        justifyContent: horizontal ? 'space-between' : 'center',
        gap: horizontal ? 8 : 2,
        minHeight: minHeight ?? undefined,
      }}
    >
      {children}
      {subtext && (
        <span style={{ opacity: 0.65, fontSize: 11, flexShrink: horizontal ? 0 : undefined }}>
          {subtext}
        </span>
      )}
    </button>
  )
}
