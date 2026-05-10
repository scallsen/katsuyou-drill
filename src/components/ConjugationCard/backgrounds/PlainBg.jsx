import { lightenHex } from '../../../utils/color.js'

export default function PlainBg({ color = 'C8B89A', transparent = false }) {
  const hex = color.replace('#', '')
  const bg    = lightenHex(hex, 0.88)
  const hLine = lightenHex(hex, 0.55)
  const vLine = lightenHex(hex, 0.65)

  return (
    <svg width="100%" height="100%" viewBox="0 0 380 276" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, left: 0 }} xmlns="http://www.w3.org/2000/svg">
      {!transparent && <rect width="380" height="276" fill={bg} />}
      <line x1="0"   y1="68.5"  x2="380" y2="68.5"  stroke={hLine} strokeWidth="3" />
      <line x1="0"   y1="110.5" x2="380" y2="110.5" stroke={hLine} strokeWidth="3" />
      <line x1="0"   y1="152.5" x2="380" y2="152.5" stroke={hLine} strokeWidth="3" />
      <line x1="0"   y1="194.5" x2="380" y2="194.5" stroke={hLine} strokeWidth="3" />
      <line x1="0"   y1="236.5" x2="380" y2="236.5" stroke={hLine} strokeWidth="3" />
      <line x1="46.5" y1="0" x2="46.5" y2="276" stroke={vLine} strokeWidth="3" />
      <line x1="61.5" y1="0" x2="61.5" y2="276" stroke={vLine} strokeWidth="3" />
    </svg>
  )
}
