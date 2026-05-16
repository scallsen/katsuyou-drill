export default function CardShell({ bgColor, border, BgComponent, children }) {
  return (
    <div
      style={{
        position: 'relative',
        border,
        backgroundColor: bgColor,
        width: '100%',
        height: '100%',
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
