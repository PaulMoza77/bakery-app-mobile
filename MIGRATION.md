# Expo React Native migration report

This document describes the conversion of the Vite web bakery app into a native **Expo** app under `mobile/`. The original web app in the repo root is unchanged and can run in parallel.

## What was converted

### Architecture
- **Expo SDK 54** with **Expo Router** (file-based navigation; compatible with Expo Go 54.x)
- **TypeScript** with path alias `@/*` → `src/*`
- **Supabase Auth** via `@supabase/supabase-js` + `AsyncStorage` session persistence
- **Role-based access**: `profiles.role` (`client` | `admin`), admin stack guarded in `app/admin/_layout.tsx`

### Shared business logic (copied from `src/`)
- `types/database.ts`, `types/auth.ts`
- `lib/database/` — queries, mappers, helpers, `runQuery`
- `lib/cart/`, `lib/format/`, `lib/drops/`, `lib/cake-builder/` (pricing, steps, submit)
- Hooks: catalog, checkout, orders, cake builder, admin products/orders/cake catalog

### Client screens (bottom tabs)
| Tab | Route | Features |
|-----|-------|----------|
| Produse | `(tabs)/index` | Categories, search, drops banner, product grid |
| Evenimente | `(tabs)/events` | Event services from Supabase |
| Personalizează | `(tabs)/customize` | Multi-step cake builder + image upload |
| Ateliere | `(tabs)/workshops` | Workshop list |
| Meniu | `(tabs)/menu` | Cart, profile, orders, admin link |

### Stack screens
- Auth: `(auth)/login`, `(auth)/register`
- `product/[id]` — detail + add to cart (drop stock caps)
- `cart` — line items, delivery options, `createOrderWithItems` (no Stripe)
- `orders` — product orders + custom cakes, cancel pending
- `profile` — account info

### Admin (protected)
- Dashboard, **products** CRUD, **categories** CRUD, **orders** status updates, **custom cakes** status updates

### UI
- React Native primitives: `View`, `Text`, `ScrollView`, `Pressable`, `TextInput`, `Image` (`expo-image`)
- StyleSheet-based theme (`src/theme/colors.ts`) — no Tailwind / NativeWind

## Intentionally not implemented (per request)
- Stripe checkout
- Push notifications
- AI support chat
- Referrals, notifications inbox, branding admin, drops admin, workshops admin, customers, support inbox (still on web only)

## Packages added (mobile)
- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `expo-image`
- `expo-image-picker`
- `expo-crypto` (storage upload paths)

## Manual adjustments recommended
1. **Environment**: Copy `.env.example` → `.env` with the same Supabase URL/anon key as web (`VITE_*` → `EXPO_PUBLIC_*`).
2. **Deep linking / OAuth**: Google OAuth redirect URLs are web-oriented; mobile sign-in is email/password only for now.
3. **Image uploads**: Cake print uses `fetch(uri)` → blob upload; test on device for large images.
4. **Shared code**: Long-term, extract `lib/database` + `types` into a workspace package to avoid duplicating copies under `mobile/src`.
5. **Admin parity**: Web admin has more modules (drops, branding, referrals, etc.) — add screens as needed.
6. **Nested git**: `mobile/` was scaffolded with its own `.git` by create-expo-app; remove or merge if you want a single repo root.
7. **Date inputs**: Delivery dates use plain `YYYY-MM-DD` text fields; consider `@react-native-community/datetimepicker`.
8. **iOS/Android permissions**: Run on device once to accept photo library permission for cake prints.

## How to run the Expo app

```bash
cd mobile
cp .env.example .env
# Edit .env with your Supabase credentials

npm install
npm run typecheck   # optional
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

For a development build with native modules:

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

## Web app
The Vite app at the repo root is still the full-featured client. Run with:

```bash
npm run dev
```
