import VARIANTS from './variants.js'
import CardShell from './CardShell.jsx'
import CardContent from './CardContent.jsx'
import FlipCard from '../../FlipCard.jsx'
import { FORMS } from '../../data/forms.js'

export default function ConjugationCard({ variant = 'plain', word = '', answer = null, negative = false, past = false, bgComponent = null, bgComponentColor = null, registerLabel = null, onFlip = null }) {
  const config = VARIANTS[variant] ?? VARIANTS.plain
  const FrontBg = bgComponent ?? config.BgComponent
  const frontBgColor = bgComponentColor ?? config.keyColor
  const answerLabel = FORMS[variant]?.axes?.includes('register') ? registerLabel : null

  const front = (
    <CardShell bgColor={config.bgColor} border={config.border} BgComponent={FrontBg} color={frontBgColor}>
      <CardContent label={config.label} n={negative} past={past} word={word} />
    </CardShell>
  )

  const back = (
    <CardShell bgColor={answer ? config.keyColor : config.bgColor} border={config.border} BgComponent={FrontBg} color={frontBgColor} bgTransparent>
      {answer && <CardContent label={config.label} n={negative} past={past} word={answer} answerLabel={answerLabel} answerBg={config.keyColor} />}
    </CardShell>
  )

  return <FlipCard front={front} back={back} width="380px" height="280px" onFlip={onFlip} />
}
