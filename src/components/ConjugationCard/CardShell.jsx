export default function CardShell({ bgColor, border, BgComponent, children }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        border,
        backgroundColor: bgColor,
        width: 380,
        height: 280,
        flexShrink: 0,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      }}
    >
      {BgComponent && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <BgComponent />
        </div>
      )}
      {children}
    </div>
  )
}
