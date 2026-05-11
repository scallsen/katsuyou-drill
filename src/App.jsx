import DrillPage from './pages/DrillPage.jsx'
import ColorReview from './pages/ColorReview.jsx'

export default function App() {
  const hash = window.location.hash
  const isColorReview = hash === '#/color-review'

  const root = document.getElementById('root')
  document.documentElement.style.overflow = isColorReview ? 'auto' : 'hidden'
  document.body.style.overflow = isColorReview ? 'auto' : 'hidden'
  root.style.overflow = isColorReview ? 'auto' : 'hidden'
  root.style.height = isColorReview ? 'auto' : '100%'

  if (isColorReview) return <ColorReview />
  return <DrillPage />
}
