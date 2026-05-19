import CardShell from '../components/ConjugationCard/CardShell.jsx'
import CardContent from '../components/ConjugationCard/CardContent.jsx'
import VARIANTS from '../components/ConjugationCard/variants.js'
import PlainBg from '../components/ConjugationCard/backgrounds/PlainBg.jsx'
import { FORMS } from '../data/forms.js'
import { FONT } from '../data/theme.js'

const CARD_W = 380
const CARD_H = 280
const SCALE = 1
const CELL_W = CARD_W * SCALE
const CELL_H = CARD_H * SCALE
const GAP = 10
const LABEL_COL_W = 72

function StaticCard({ variantKey, bgComponent, bgComponentColor, flipped, negative, past, word, answer, registerLabel }) {
  const config = VARIANTS[variantKey]
  const FrontBg = bgComponent ?? config.BgComponent
  const frontBgColor = bgComponentColor ?? config.keyColor
  const answerLabel = FORMS[variantKey]?.axes?.includes('register') ? registerLabel : null

  const shell = flipped
    ? (
      <CardShell bgColor={answer ? config.backColor : config.bgColor} border={config.border} BgComponent={FrontBg} color={config.backColor} bgTransparent>
        {answer && <CardContent label={config.label} n={negative} past={past} word={answer} answerLabel={answerLabel} answerBg={config.backColor} />}
      </CardShell>
    )
    : (
      <CardShell bgColor={config.bgColor} border={config.border} BgComponent={FrontBg} color={frontBgColor}>
        <CardContent label={config.label} n={negative} past={past} word={word} answerLabel={answerLabel} answerBg={config.bgColor} />
      </CardShell>
    )

  return (
    <div style={{ width: CELL_W, height: CELL_H, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
        {shell}
      </div>
    </div>
  )
}

const COLS = [
  { label: 'Polite Front', flipped: false, plain: false, registerLabel: 'Polite' },
  { label: 'Polite Back',  flipped: true,  plain: false, registerLabel: 'Polite' },
  { label: 'Plain Front',  flipped: false, plain: true,  registerLabel: 'Plain'  },
  { label: 'Plain Back',   flipped: true,  plain: true,  registerLabel: 'Plain'  },
]

const ROW_LABEL_STYLE = {
  width: LABEL_COL_W,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  color: 'rgba(255,255,255,0.3)',
  fontSize: 10,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

export default function ColorReview() {
  const variantKeys = Object.keys(VARIANTS)

  return (
    <div style={{ background: '#1E1E1E', minHeight: '100vh', padding: '32px 32px 64px', fontFamily: FONT }}>
      <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Color Review</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 36 }}>
        Card color combinations across all forms — word: 食べる / answer: 食べます
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', gap: GAP, marginBottom: 12, paddingLeft: LABEL_COL_W }}>
        {COLS.map(col => (
          <div
            key={col.label}
            style={{ width: CELL_W, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {variantKeys.map(key => {
        const formColor = FORMS[key]?.color

        return (
          <div key={key} style={{ marginBottom: 28 }}>
            {/* Form name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: formColor, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {VARIANTS[key].label}
              </span>
            </div>

            {/* Row 1 — no stamps */}
            <div style={{ display: 'flex', gap: GAP, alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={ROW_LABEL_STYLE}>No stamps</div>
              {COLS.map(col => (
                <StaticCard
                  key={col.label}
                  variantKey={key}
                  flipped={col.flipped}
                  negative={false}
                  past={false}
                  word="食べる"
                  answer="食べます"
                  bgComponent={col.plain ? PlainBg : null}
                  bgComponentColor={col.plain ? formColor : null}
                  registerLabel={col.registerLabel}
                />
              ))}
            </div>

            {/* Row 2 — both stamps */}
            <div style={{ display: 'flex', gap: GAP, alignItems: 'flex-start' }}>
              <div style={ROW_LABEL_STYLE}>Neg + Past</div>
              {COLS.map(col => (
                <StaticCard
                  key={col.label}
                  variantKey={key}
                  flipped={col.flipped}
                  negative={true}
                  past={true}
                  word="食べる"
                  answer="食べません"
                  bgComponent={col.plain ? PlainBg : null}
                  bgComponentColor={col.plain ? formColor : null}
                  registerLabel={col.registerLabel}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
