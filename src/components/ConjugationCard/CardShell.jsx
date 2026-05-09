export default function CardShell({ bgColor, border, BgComponent, children }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 16,
        border,
        backgroundColor: bgColor,
        width: 280,
        height: 380,
        flexShrink: 0,
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
