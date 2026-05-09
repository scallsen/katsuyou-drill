export default function CardShell({ bgColor, border, BgComponent, children }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 16,
        border,
        backgroundColor: bgColor,
        width: 380,
        height: 280,
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
