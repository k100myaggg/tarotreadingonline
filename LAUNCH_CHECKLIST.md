# Arcana 3D: Production Launch Checklist

## 1. Environment & Secrets Verification
- [ ] `NODE_ENV="production"` set in host (Vercel / Cloudflare).
- [ ] `NEXT_PUBLIC_APP_URL` configured to the production canonical domain (e.g. `https://arcana3d.com`).
- [ ] `ANTHROPIC_API_KEY` configured and tested with valid credits.
- [ ] `ANTHROPIC_MODEL` set (recommended: `claude-3-5-sonnet-20241022`).
- [ ] `DATABASE_URL` and `DIRECT_URL` configured for pooled and direct PostgreSQL connections (Neon / Supabase).
- [ ] `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` active in live mode.
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configured.

---

## 2. Cryptographic Randomness & Deck Verification
- [x] Fisher-Yates shuffle uses Node's CSPRNG (`crypto.randomInt`).
- [x] Reversal assignment is 100% cryptographically randomized.
- [x] Zero duplicate cards drawn per spread (tested across 1,000 automated simulations).
- [x] 1909 Rider-Waite-Smith deck verified public domain worldwide.
- [x] LLM never picks cards; draw is persisted before AI inference.

---

## 3. 3D Experience, WebGL & Fallbacks
- [x] React Three Fiber + Three.js canvas renders at 60fps desktop / 30+fps mobile.
- [x] Procedural canvas textures generate crisp gold foil card backs and front tarot iconography with zero network latency.
- [x] Automatic WebGL detection with graceful fallback to Accessible 2D Card Sanctuary.
- [x] Keyboard accessibility support for card selection and flipping.
- [x] Prefers-reduced-motion compatibility.

---

## 4. AI Reading Pipeline & Safety Guardrails
- [x] 3 Reader Personas: *The Mystic Sage*, *The Intuitive Empath*, *The Direct Strategist*.
- [x] Structural relationship analysis computes Major Arcana ratio, dominant elements/suits, repeated numbers, and reversals count.
- [x] Canonical RWS meanings injected directly from local 78-card registry.
- [x] Crisis intercept detects self-harm/suicide terms in English, Hindi, and Japanese, returning immediate confidential helplines (988, Vandrevala Foundation, TELL Japan).
- [x] No certainty or fatalistic predictions on death, diagnosis, stock trades, or legal trials.

---

## 5. Credit Ledger & Stripe Monetization
- [x] Double-entry credit ledger with atomic deduction.
- [x] Free credits prioritized before purchased credits are debited.
- [x] Idempotency key protection prevents duplicate debit charges and replay exploits.
- [x] Idempotent Stripe webhook receiver verifies event ID to prevent multiple credit allocations.
- [x] Daily credit claim with consecutive day streak reward tracking.

---

## 6. Internationalization (i18n) & SEO
- [x] Full App Router locale routing for `en`, `hi` (Hindi), and `ja` (Japanese).
- [x] 78 static indexable card pages (`/[locale]/cards/[slug]`) pre-rendered at build time.
- [x] Spread guide pages (`/[locale]/spreads/[slug]`) pre-rendered with position architectures.
- [x] JSON-LD Schema.org structured data (`Article` / `DefinedTerm`).
- [x] Dynamic `sitemap.xml` indexing all 250+ static pages.
- [x] Dynamic `robots.txt` protecting API endpoints.

---

## 7. Pre-Deploy Testing & Build Commands
```bash
# Run complete unit test suite (RNG, Credit Ledger, Prompt Builder, Safety)
npm test

# Run full Next.js production build with Turbopack
npm run build

# Start production server locally
npm run start
```
