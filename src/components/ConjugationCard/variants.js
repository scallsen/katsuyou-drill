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
    bgColor: '#ddeeff',
    border: '2px solid #7aafd4',
    BgComponent: null,
  },
}

export default VARIANTS
