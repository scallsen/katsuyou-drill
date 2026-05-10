export default function SelectButton({ selected, bgColor = '#ffffff', borderColor = 'transparent', onClick, children }) {
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
        textAlign: 'left',
        width: '100%',
      }}
    >
      {children}
    </button>
  )
}
