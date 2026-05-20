import DrillPage from './pages/DrillPage.jsx'
import ColorReview from './pages/ColorReview.jsx'

export default function App() {
  const hash = window.location.hash
  const isColorReview = hash === '#/color-review'

  const root = document.getElementById('root')
  const overflow = isColorReview ? 'auto' : 'hidden'
  document.documentElement.style.overflow = overflow
  document.body.style.overflow = overflow
  root.style.overflow = overflow
  root.style.height = isColorReview ? 'auto' : '100%'

  if (isColorReview) return <ColorReview />
  return <DrillPage />
}
