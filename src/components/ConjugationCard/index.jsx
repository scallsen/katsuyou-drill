import VARIANTS from './variants.js'
import CardShell from './CardShell.jsx'
import CardContent from './CardContent.jsx'

export default function ConjugationCard({ variant = 'plain', word = '', negative = false, past = false }) {
  const config = VARIANTS[variant] ?? VARIANTS.plain
  return (
    <CardShell bgColor={config.bgColor} border={config.border} BgComponent={config.BgComponent}>
      <CardContent label={config.label} n={negative} past={past} word={word} />
    </CardShell>
  )
}
