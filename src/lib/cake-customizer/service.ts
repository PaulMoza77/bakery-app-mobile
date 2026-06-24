import { MOCK_CAKE_CUSTOMIZER_CATALOG } from '@/lib/cake-customizer/cakeCustomizer.mock'
import type {
  CakeCustomizationRequestPayload,
  CakeCustomizerCatalog,
  CakeCustomizationState,
} from '@/lib/cake-customizer/types'

/**
 * Loads cake customizer options. Currently returns mock data;
 * replace with Supabase/API fetch when admin catalog is ready.
 */
export async function getCakeCustomizerOptions(): Promise<CakeCustomizerCatalog> {
  // Simulate network latency for realistic loading states during dev
  await new Promise((resolve) => setTimeout(resolve, 120))
  return MOCK_CAKE_CUSTOMIZER_CATALOG
}

/**
 * Submits a cake customization request. Currently logs the payload;
 * replace with DB insert when backend is ready.
 */
export async function submitCakeCustomizationRequest(
  payload: CakeCustomizationRequestPayload,
): Promise<{ ok: true; requestId: string } | { ok: false; error: string }> {
  const requestId = `mock-${Date.now()}`
  console.info('[cake-customizer] submit', { requestId, ...payload })

  // Placeholder for future Supabase insert:
  // await supabase.from('cake_customization_requests').insert({ ... })

  await new Promise((resolve) => setTimeout(resolve, 400))
  return { ok: true, requestId }
}

export function buildCustomizationRequestPayload(
  state: CakeCustomizationState,
  breakdown: CakeCustomizationRequestPayload['breakdown'],
): CakeCustomizationRequestPayload {
  return {
    state,
    breakdown,
    submittedAt: new Date().toISOString(),
  }
}
