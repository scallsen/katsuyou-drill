export default function GraphBg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 380 276" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, left: 0 }} xmlns="http://www.w3.org/2000/svg">
      <rect width="380" height="276" fill="white" />
      {[31, 73, 115, 157, 199, 241].map(y =>
        [42, 84, 126, 168, 210, 252, 294, 336].map(x =>
          <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill="black" fillOpacity="0.2" />
        )
      )}
    </svg>
  )
}
