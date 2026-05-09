import BgtexturePlain from './bgtexture-plain.svg?react'

export default function PlainBg() {
  return (
    <BgtexturePlain
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  )
}
