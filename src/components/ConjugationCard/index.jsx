import VARIANTS from './variants.js'
import CardShell from './CardShell.jsx'
import CardContent from './CardContent.jsx'
import FlipCard from '../../FlipCard.jsx'

export default function ConjugationCard({ variant = 'plain', word = '', answer = null, negative = false, past = false }) {
  const config = VARIANTS[variant] ?? VARIANTS.plain

  const front = (
    <CardShell bgColor={config.bgColor} border={config.border} BgComponent={config.BgComponent}>
      <CardContent label={config.label} n={negative} past={past} word={word} />
    </CardShell>
  )

  const back = (
    <CardShell bgColor={config.bgColor} border={config.border} BgComponent={config.BgComponent}>
      {answer && <CardContent label={config.label} n={negative} past={past} word={answer} isAnswer />}
    </CardShell>
  )

  return <FlipCard front={front} back={back} width="380px" height="280px" />
}
