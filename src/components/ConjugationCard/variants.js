import { PlainBg } from './backgrounds/index.js'

const VARIANTS = {
  plain: {
    label: 'Plain',
    bgColor: '#f5f0e8',
    border: '2px solid #c8b89a',
    BgComponent: PlainBg,
  },
  polite: {
    label: 'Polite',
    bgColor: '#ffffff',
    border: '2px solid #d0d0d0',
    BgComponent: null,
  },
}

export default VARIANTS
