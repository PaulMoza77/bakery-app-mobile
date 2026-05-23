import type { CakeBuilderStep } from '@/lib/cake-builder/types'

export const CAKE_BUILDER_STEPS: CakeBuilderStep[] = [
  {
    id: 'size',
    label: 'Mărime',
    title: 'Mărime tort',
    subtitle: 'Dimensiunea stabilește prețul de bază',
  },
  { id: 'flavor', label: 'Aromă', title: 'Aromă', subtitle: 'Alege gustul principal' },
  {
    id: 'filling',
    label: 'Umplutură',
    title: 'Umplutură',
    subtitle: 'Ce ascunde tortul în interior',
  },
  { id: 'cream', label: 'Cremă', title: 'Cremă', subtitle: 'Finisajul exterior' },
  {
    id: 'design',
    label: 'Design',
    title: 'Stil design',
    subtitle: 'Aspectul general al tortului',
  },
  {
    id: 'personalize',
    label: 'Text',
    title: 'Text & imagine',
    subtitle: 'Mesaj pe tort și referință foto (opțional)',
  },
  {
    id: 'candles',
    label: 'Lumânări',
    title: 'Lumânări',
    subtitle: 'Opțional — alege un set sau sari mai departe',
  },
  {
    id: 'toppers',
    label: 'Topper',
    title: 'Topper',
    subtitle: 'Decorațiune deasupra tortului (opțional)',
  },
  {
    id: 'extras',
    label: 'Extra',
    title: 'Extra',
    subtitle: 'Ambalaj și alte opțiuni (opțional)',
  },
  {
    id: 'delivery',
    label: 'Livrare',
    title: 'Livrare & note',
    subtitle: 'Data ridicării și instrucțiuni pentru patiserie',
  },
]
