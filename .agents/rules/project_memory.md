# Project Memory & Permanent Guidelines (Arcana 3D / Tarot Reading)

## 1. Deployment & Git Workflow (CRITICAL)
- **GitHub Repository**: `https://github.com/k100myaggg/tarotreadingonline.git` (Default branch: `main`).
- **Live Hosting**: **Vercel is actively linked to this GitHub repository**. Every push to `origin/main` automatically triggers a live production deployment.
- **Rule**: Do NOT ask the user if Vercel is connected or if changes need to be deployed. Once code changes are validated with `npm test` and `npx tsc --noEmit`, commit with a clear conventional commit message and push to `origin/main`.

## 2. Card Design & Visual Assets (STRICT)
- **Card Back Cover**: The official card back is the high-resolution artwork at `/cards/card_back.jpg` (`public/cards/card_back.jpg`) featuring the royal purple cosmic nebula, golden Eye of Providence mandala, and baroque flourishes.
- **Rule**: NEVER replace `/cards/card_back.jpg` with a procedural canvas or any alternative artwork. The user strongly prefers and mandated this exact artwork.
- In `src/components/3d/cardTextures.ts`, `getCardBackTexture()` must always load `CARD_BACK_IMAGE_PATH` (`/cards/card_back.jpg`), with procedural canvas only as an offline error fallback.

## 3. Tech Stack & Key Architectures
- **Framework**: Next.js (App Router) + Turbopack.
- **3D Engine**: React Three Fiber (`@react-three/fiber`), `@react-three/drei`, Three.js.
  - Components: `DeckShuffle3D`, `DeckCut3D`, `FloatingCardField`, `SpreadCardModel`, `StarfieldNebula`, `DriftingBackgroundCards`.
  - Fallback: `Fallback2DCardField` for non-WebGL environments.
- **Audio Engine**: `src/lib/audio/soundscape.ts` (`mysticAudio`) using Web Audio API synthesized soundscapes + custom audio cascades.
- **AI Reading Engine**: Anthropic Claude API (`src/lib/ai/readingEngine.ts`, `promptBuilder.ts`, `safetyGuardrails.ts`).
- **Payments & Credits**: Stripe checkout & webhooks (`src/app/api/webhooks/stripe/route.ts`), atomic credit ledger (`src/lib/credits/ledger.ts`).
- **i18n**: English (`en`), Hindi (`hi`), Japanese (`ja`).

## 4. Verification Standards
- Before completing any task:
  1. `npm test` (all 23 tests in Vitest must pass).
  2. `npx tsc --noEmit` (clean zero TypeScript errors).
