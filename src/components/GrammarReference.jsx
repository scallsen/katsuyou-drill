import { useState, useEffect } from 'react'
import grammarData from '../data/grammarReference.json'
import { FORMS } from '../data/forms.js'

const ALL_FORMS = grammarData.groups.flatMap(g => g.forms)
const FORM_BY_ID = Object.fromEntries(ALL_FORMS.map(f => [f.id, f]))

function useNarrow(breakpoint = 500) {
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth <= breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = e => setIsNarrow(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isNarrow
}

function Section({ section, topMargin }) {
  return (
    <div style={{ marginTop: topMargin ? 16 : 0 }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em', marginBottom: 6, marginTop: 0 }}>
        {section.label}
      </p>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          {section.rows.map((row, ri) => (
            <tr key={ri}>
              <td style={{ color: 'rgba(255,255,255,0.4)', padding: '4px 0' }}>{row.from}</td>
              <td style={{ color: 'rgba(255,255,255,0.2)', padding: '0 14px' }}>→</td>
              <td style={{ color: '#fff', padding: '4px 0' }}>{row.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {section.note && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '6px 0 0' }}>
          {section.note}
        </p>
      )}
    </div>
  )
}

function FormSections({ sections, narrow }) {
  if (!sections.length) return null
  const [first, ...rest] = sections
  if (narrow || rest.length === 0) {
    return (
      <div>
        <Section section={first} />
        {rest.map((section, i) => <Section key={i} section={section} topMargin />)}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Section section={first} />
      </div>
      <div style={{ flex: 1 }}>
        {rest.map((section, i) => <Section key={i} section={section} topMargin={i > 0} />)}
      </div>
    </div>
  )
}

function placeholder(id) {
  return {
    title: id.replace(/_/g, '-'),
    jp: '—',
    usage: 'Content for this form coming soon.',
    sections: [],
  }
}

export default function GrammarReference({ open, onClose }) {
  const [active, setActive] = useState('passive')
  const isNarrow = useNarrow()

  if (!open) return null

  const form = FORM_BY_ID[active] ?? {}
  const data = form.title ? form : placeholder(active)
  const formColor = FORMS[active]?.color ?? null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isNarrow ? '0.75rem' : '1.5rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#2E2E2E',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          width: '100%',
          maxWidth: 620,
          height: isNarrow ? '90dvh' : 500,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'DotGothic16', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, color: '#fff', letterSpacing: '0.04em' }}>Grammar reference</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: isNarrow ? 'column' : 'row', flex: 1, minHeight: 0 }}>

          {isNarrow ? (
            /* Narrow: top dropdown bar */
            <div style={{
              flexShrink: 0,
              background: '#242424',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 14px',
            }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={active}
                  onChange={e => setActive(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#2E2E2E',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6,
                    padding: '8px 32px 8px 10px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                >
                  {grammarData.groups.map(group => (
                    <optgroup key={group.key} label={group.label.toUpperCase()}>
                      {group.forms.map(item => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <span style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  pointerEvents: 'none',
                }}>▾</span>
              </div>
            </div>
          ) : (
            /* Wide: left sidebar */
            <nav className="sidebar-scroll" style={{
              width: 155,
              flexShrink: 0,
              background: '#242424',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              overflowY: 'auto',
              padding: '8px 0',
            }}>
              {grammarData.groups.map((group, gi) => (
                <div key={group.key}>
                  {gi > 0 && (
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '6px 0' }} />
                  )}
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 12px 4px', margin: 0 }}>
                    {group.label}
                  </p>
                  {group.forms.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        background: active === item.id ? 'rgba(255,255,255,0.08)' : 'none',
                        border: 'none',
                        fontSize: 13,
                        color: active === item.id ? '#fff' : 'rgba(255,255,255,0.55)',
                        padding: '7px 12px',
                        cursor: 'pointer',
                        lineHeight: 1.3,
                        fontFamily: 'inherit',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          )}

          {/* Content */}
          <div className="sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
              <p style={{ fontSize: 13, color: '#fff', margin: 0 }}>{data.title}</p>
              {formColor && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: formColor, flexShrink: 0, marginTop: 3 }} />
              )}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 12, marginTop: 0 }}>
              {data.jp}
            </p>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7,
              paddingBottom: 14,
              marginBottom: 14,
              marginTop: 0,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              {data.usage}
            </p>

            <FormSections sections={data.sections} narrow={isNarrow} />
          </div>

        </div>
      </div>
    </div>
  )
}
