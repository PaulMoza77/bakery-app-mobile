import type { AiReplyRequest, AiReplyResult, AiSupportProvider } from '@/lib/support/ai/types'

const FAQ: { pattern: RegExp; answer: string }[] = [
  {
    pattern: /\b(program|orar|deschid)\b/i,
    answer:
      'Patiseria este deschisă marți–duminică, 08:00–20:00. Luni este zi de pregătire — precomenzile se ridică după ora 10:00.',
  },
  {
    pattern: /\b(livrare|transport)\b/i,
    answer:
      'Livrăm în București și împrejurimi. Comanda minimă pentru livrare este 150 lei. Pentru torturi custom, alege data la pasul „Livrare”.',
  },
  {
    pattern: /\b(precomand|drop|disponibil)\b/i,
    answer:
      'Produsele „drop” apar în tab-ul Produse în ziua lansării. Precomenzile se plasează cu 48h înainte — vezi secțiunea Precomandă.',
  },
  {
    pattern: /\b(workshop|atelier)\b/i,
    answer:
      'Workshopurile sunt în tab-ul Workshopuri. După plată primești acces la înregistrare — detaliile vin pe email.',
  },
]

const ESCALATION_TRIGGERS = [
  /\b(reclam|ramburs|anul|stricat|intarziat)\b/i,
  /\b(urgent|avocat|pres[aă])\b/i,
  /\bnu\s+(merge|pot|functioneaza)\b/i,
  /\bproblema\s+cu\s+comanda\b/i,
]

export class PlaceholderAiSupportProvider implements AiSupportProvider {
  readonly id = 'placeholder-v1'

  async generateReply(request: AiReplyRequest): Promise<AiReplyResult> {
    const text = request.userMessage.trim()

    for (const trigger of ESCALATION_TRIGGERS) {
      if (trigger.test(text)) {
        return {
          resolved: false,
          message: '',
          reason: 'Mesaj marcat pentru escaladare (cuvinte cheie)',
        }
      }
    }

    for (const entry of FAQ) {
      if (entry.pattern.test(text)) {
        return {
          resolved: true,
          message: `${entry.answer}\n\nDacă ai nevoie de altceva, spune-mi!`,
        }
      }
    }

    if (text.length < 8) {
      return {
        resolved: true,
        message:
          'Cu ce te pot ajuta? Întreabă despre program, livrare, precomenzi sau workshopuri.',
      }
    }

    return {
      resolved: false,
      message: '',
      reason: 'Întrebare în afara bazei de cunoștințe (placeholder AI)',
    }
  }
}
