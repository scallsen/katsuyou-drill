import VARIANTS from './variants.js'
import CardShell from './CardShell.jsx'
import CardContent from './CardContent.jsx'
import FlipCard from '../../FlipCard.jsx'
import { FORMS } from '../../data/forms.js'

export default function ConjugationCard({ variant = 'plain', word = '', kana = null, showFurigana = false, pixelFont = true, answer = null, negative = false, past = false, bgComponent = null, bgComponentColor = null, registerLabel = null, flipped = false, onFlip = null }) {
  const config = VARIANTS[variant] ?? VARIANTS.plain
  const FrontBg = bgComponent ?? config.BgComponent
  const frontBgColor = bgComponentColor ?? config.keyColor
  const answerLabel = FORMS[variant]?.axes?.includes('register') ? registerLabel : null

  const front = (
    <CardShell bgColor={config.bgColor} border={config.border} BgComponent={FrontBg} color={frontBgColor}>
      <CardContent label={config.label} n={negative} past={past} word={word} kana={kana} showFurigana={showFurigana} pixelFont={pixelFont} answerLabel={answerLabel} answerBg={config.bgColor} />
    </CardShell>
  )

  const back = (
    <CardShell bgColor={answer ? config.backColor : config.bgColor} border={config.border} BgComponent={FrontBg} color={config.backColor} bgTransparent>
      {answer && <CardContent label={config.label} n={negative} past={past} word={answer} kana={kana} wordKanji={word} showFurigana={showFurigana} pixelFont={pixelFont} answerLabel={answerLabel} answerBg={config.backColor} />}
    </CardShell>
  )

  return <FlipCard front={front} back={back} width="380px" height="280px" flipped={flipped} onFlip={onFlip} />
}
