export default function SelectionError({ visible }) {
  if (!visible) return null
  return (
    <div style={{ color: '#F5C842', fontSize: 11, marginTop: 6 }}>
      Select at least 1 option
    </div>
  )
}
