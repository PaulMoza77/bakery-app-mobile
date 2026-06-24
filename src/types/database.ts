import type { UserRole } from '@/types/auth'

/** Money fields are integer cents (RON bani) */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type DeliveryType = 'pickup' | 'delivery'
export type CustomCakeStatus =
  | 'draft'
  | 'submitted'
  | 'in_progress'
  | 'ready'
  | 'cancelled'
export type EventInquiryStatus = 'new' | 'contacted' | 'closed'
export type SupportThreadStatus = 'open' | 'escalated' | 'closed' | 'ai_pending'
export type SupportSenderType = 'client' | 'admin' | 'ai'
export type NotificationCategory =
  | 'system'
  | 'order'
  | 'offer'
  | 'support'
  | 'promo'
export type NotificationSource = 'admin' | 'system' | 'order' | 'support'
export type NotificationChannelStatus =
  | 'pending'
  | 'skipped'
  | 'sent'
  | 'failed'
export type ReferralInviteStatus = 'registered' | 'rewarded'
export type ReferralRewardStatus =
  | 'pending'
  | 'placeholder_granted'
  | 'paid'
  | 'cancelled'
export type ReferralRewardRole = 'referrer' | 'referred'
export type CakeOptionType =
  | 'size'
  | 'flavor'
  | 'filling'
  | 'cream'
  | 'design_style'

export type CakeAddonCategory = 'extra' | 'candles' | 'topper'

export interface ProfileRow {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type ProductUnit = 'buc' | 'kg' | 'platou' | 'set'
export type StockStatus = 'in_stock' | 'out_of_stock' | 'preorder'
export type AppSectionType = 'product_carousel' | 'category_grid' | 'banner'
export type AppSectionPlacement = 'products_home' | 'homepage' | 'site_home'
export type CartStatus = 'active' | 'converted' | 'abandoned'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url: string | null
  sort_order: number
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface ProductRow {
  id: string
  category_id: string | null
  name: string
  slug?: string | null
  description: string | null
  short_description?: string | null
  price: number
  currency?: string
  unit?: ProductUnit
  image_url: string | null
  is_active: boolean
  is_preorder: boolean
  is_popular?: boolean
  is_back_in_stock?: boolean
  is_featured?: boolean
  stock_status?: StockStatus
  available_from?: string | null
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface ProductImageRow {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean
  created_at: string
}

export interface AppSectionRow {
  id: string
  title: string
  slug: string
  section_type: AppSectionType
  placement: AppSectionPlacement
  sort_order: number
  is_active: boolean
  filters: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ProductDropRow {
  id: string
  product_id: string
  drop_date: string
  start_time: string | null
  end_time: string | null
  quantity_available: number
  quantity_sold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrderRow {
  id: string
  user_id: string | null
  status: OrderStatus
  total_amount: number
  payment_status: PaymentStatus
  delivery_type: DeliveryType
  delivery_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemRow {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface OrderItemWithProduct extends OrderItemRow {
  products: { name: string; image_url: string | null } | null
}

export interface OrderWithItems extends OrderRow {
  order_items: OrderItemRow[]
}

export interface OrderWithItemsAndProducts extends OrderRow {
  order_items: OrderItemWithProduct[]
}

export type CategorySummary = Pick<CategoryRow, 'id' | 'name' | 'slug'>

export interface ProductWithCategory extends ProductRow {
  categories: CategorySummary | CategorySummary[] | null
}

export interface CakeOptionRow {
  id: string
  type: string
  name: string
  price_modifier: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CakeAddonRow {
  id: string
  name: string
  price: number
  category: CakeAddonCategory
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomCakeOrderRow {
  id: string
  user_id: string
  size: string | null
  flavor: string | null
  filling: string | null
  cream: string | null
  design_style: string | null
  cake_text: string | null
  printed_image_url: string | null
  addons: unknown
  calculated_price: number
  status: CustomCakeStatus
  delivery_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WorkshopRow {
  id: string
  title: string
  description: string | null
  price: number
  image_url: string | null
  video_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AtelierProductType = 'event' | 'workshop' | 'recipe'
export type AtelierPurchaseStatus = 'paid' | 'pending' | 'failed'

export interface AtelierProductRow {
  id: string
  type: AtelierProductType
  title_ro: string
  title_en: string | null
  slug: string
  short_description_ro: string | null
  description_ro: string | null
  image_url: string | null
  gallery_images: unknown
  price: number
  currency: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  event_date: string | null
  event_time: string | null
  location_name: string | null
  location_address: string | null
  seats_total: number | null
  seats_available: number | null
  host_name: string | null
  included_items: string[] | null
  video_url: string | null
  duration_minutes: number | null
  presenter_name: string | null
  difficulty: string | null
  what_you_learn: string[] | null
  included_materials: string[] | null
  workshop_category: string | null
  pdf_url: string | null
  recipe_video_url: string | null
  preparation_time_minutes: number | null
  ingredients_preview: string | null
  full_content_locked: boolean
  allergens: string[] | null
  created_at: string
  updated_at: string
}

export interface AtelierEntitlementRow {
  id: string
  user_id: string
  product_id: string
  product_type: AtelierProductType
  purchase_status: AtelierPurchaseStatus
  access_granted: boolean
  purchased_at: string | null
  created_at: string
  updated_at: string
}

export interface EventInquiryRow {
  id: string
  user_id: string | null
  event_type: string
  event_date: string | null
  guest_count: number | null
  budget: number | null
  message: string | null
  status: EventInquiryStatus
  created_at: string
  updated_at: string
}

export interface SupportThreadRow {
  id: string
  /** Client auth user id (spec: client_id) */
  user_id: string
  status: SupportThreadStatus
  assigned_admin_id: string | null
  ai_failed: boolean
  ai_enabled: boolean
  ai_takeover: boolean
  client_last_read_at: string | null
  admin_last_read_at: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportMessageRow {
  id: string
  thread_id: string
  sender_id: string | null
  /** Spec alias: sender_role */
  sender_type: SupportSenderType
  message: string
  is_ai: boolean
  created_at: string
}

export interface ReferralCodeRow {
  user_id: string
  code: string
  created_at: string
}

export interface ReferralInviteRow {
  id: string
  referrer_user_id: string
  referred_user_id: string
  referral_code: string
  status: ReferralInviteStatus
  created_at: string
  registered_at: string
}

export interface ReferralRewardRow {
  id: string
  invite_id: string
  beneficiary_user_id: string
  reward_role: ReferralRewardRole
  status: ReferralRewardStatus
  amount_cents: number
  notes: string | null
  created_at: string
  granted_at: string | null
}

export interface AppSettingsRow {
  id: string
  app_name: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  surface_color: string
  text_color: string
  heading_font: string
  body_font: string
  button_radius: string
  card_radius: string
  created_at: string
  updated_at: string
}

export interface NotificationRow {
  id: string
  user_id: string
  title: string
  body: string
  category: NotificationCategory
  source: NotificationSource
  action_url: string | null
  read_at: string | null
  push_status: NotificationChannelStatus
  email_status: NotificationChannelStatus
  created_by: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string }; Update: Partial<ProfileRow> }
      categories: { Row: CategoryRow }
      products: { Row: ProductRow }
      product_images: { Row: ProductImageRow }
      app_sections: { Row: AppSectionRow }
      product_drops: { Row: ProductDropRow }
      orders: { Row: OrderRow }
      order_items: { Row: OrderItemRow }
      cake_options: { Row: CakeOptionRow }
      cake_addons: { Row: CakeAddonRow }
      custom_cake_orders: { Row: CustomCakeOrderRow }
      workshops: { Row: WorkshopRow }
      atelier_products: { Row: AtelierProductRow }
      atelier_entitlements: { Row: AtelierEntitlementRow }
      event_inquiries: { Row: EventInquiryRow }
      support_threads: { Row: SupportThreadRow }
      support_messages: { Row: SupportMessageRow }
      notifications: { Row: NotificationRow }
      referral_codes: { Row: ReferralCodeRow }
      referral_invites: { Row: ReferralInviteRow }
      referral_rewards: { Row: ReferralRewardRow }
      app_settings: { Row: AppSettingsRow }
    }
  }
}

export type ProfileUpdate = Pick<ProfileRow, 'full_name' | 'phone'>
