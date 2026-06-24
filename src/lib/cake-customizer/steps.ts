import type { CakeCustomizerStep } from '@/lib/cake-customizer/types'

export const CAKE_CUSTOMIZER_STEPS: CakeCustomizerStep[] = [
  {
    id: 'persons',
    title: 'Câte persoane?',
    subtitle: 'Glisează pentru a alege dimensiunea.',
  },
  {
    id: 'tiers',
    title: 'Câte etaje?',
    subtitle: '1, 2 sau 3 etaje.',
  },
  {
    id: 'sponge',
    title: 'Blatul',
    subtitle: 'Alege aroma bazei.',
  },
  {
    id: 'cream',
    title: 'Crema',
    subtitle: 'Alege umplutura.',
  },
  {
    id: 'glaze',
    title: 'Finisaj exterior',
    subtitle: 'Alege aspectul final.',
  },
  {
    id: 'personalization',
    title: 'Personalizare',
    subtitle: 'Mesaj, culoare, temă sau inspirație foto — opțional.',
  },
  {
    id: 'summary',
    title: 'Rezumat',
    subtitle: 'Verifică alegerile și prețul estimativ.',
  },
]
