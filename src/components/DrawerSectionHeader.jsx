export default function DrawerSectionHeader({ title, hasSelections, onClearAll }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </div>
      {hasSelections && (
        <button
          onClick={onClearAll}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}
        >
          Unselect all
        </button>
      )}
    </div>
  )
}
