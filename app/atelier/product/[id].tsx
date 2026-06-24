import { useLocalSearchParams } from 'expo-router'
import { AtelierProductDetailScreen } from '@/components/atelier/AtelierProductDetailScreen'
import { resolveRouteParam } from '@/lib/route-params'

export default function AtelierProductRoute() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const productId = resolveRouteParam(idParam)

  return <AtelierProductDetailScreen productId={productId} />
}
