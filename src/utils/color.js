export function lightenHex(hex, amount = 0.85) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `#${[r, g, b].map(c => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0')).join('')}`
}

export function getTextColor(hex) {
  const clean = hex.replace('#', '')
  const toLinear = c => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }
  const r = toLinear(parseInt(clean.slice(0, 2), 16))
  const g = toLinear(parseInt(clean.slice(2, 4), 16))
  const b = toLinear(parseInt(clean.slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35 ? '#000000' : '#ffffff'
}
