# Arcana 3D — Sacred AI Tarot Reading

An authentic, production-ready 3D AI tarot reading sanctuary. Ask your question, shuffle the floating deck in real-time 3D, pick cards from an orbital amphitheater, and receive an evocative, streamed reading from a named reader persona steeped in classical 1909 Rider-Waite-Smith hermetic wisdom.

---

## ✨ Key Features

1. **Real-Time 3D Experience (Three.js + R3F + Drei)**:
   - 3D deck riffle shuffle animation with arc kinematics.
   - 78-card floating amphitheater field over an animated starfield nebula.
   - Interactive hover elevation with gold glow aura, selection counter, and staggered 3D flip reveals with reversal inversion.
   - Accessible 2D fallback mode with full keyboard navigation and `prefers-reduced-motion` support.

2. **Cryptographic Randomness (CSPRNG)**:
   - Cards and upright/reversed orientations are drawn exclusively on the server using Node's `crypto.randomInt` with Fisher-Yates rejection sampling.
   - Zero duplicate cards per spread (verified across 1,000 automated simulations).
   - The LLM **never** selects cards.

3. **Streamed AI Persona Pipeline**:
   - Anthropic Claude API streaming with sub-second Time-To-First-Token.
   - 3 Sovereign Reader Personas:
     - **The Mystic Sage**: Archetypal, philosophical, cosmological.
     - **The Intuitive Empath**: Emotionally attuned, compassionate, inner child healing.
     - **The Direct Strategist**: Pragmatic, incisive, actionable directives.
   - Structural relationship analysis computes Major Arcana ratios, dominant elements, repeated numbers, and reversals.
   - Structured JSON response containing card analyses, holistic synthesis, practical action anchor, and 3 suggested follow-up questions.
   - Contextual follow-up chat maintaining reading history and extra guidance card draws.

4. **Safety & Ethical Guardrails**:
   - Crisis intercept detects self-harm and suicide inquiries in English, Hindi, and Japanese, returning immediate confidential 24/7 helpline resources.
   - Strict reflection mirror framing: zero fatalistic claims on death, physical diagnosis, stock trades, or legal trials.

5. **Accounts, Credit Ledger & Monetization**:
   - Frictionless first reading for guests with no sign-up required.
   - Double-entry atomic credit ledger prioritizing free daily credits over purchased credits.
   - Idempotent Stripe webhook receiver defending against duplicate charges or replay exploits.
   - Daily card draw with consecutive day streak reward tracking.

6. **SEO & Internationalization (i18n)**:
   - Next.js App Router subpath routing for English (`en`), Hindi (`hi`), and Japanese (`ja`).
   - 78 static pre-rendered card pages (`/[locale]/cards/[slug]`) with JSON-LD Schema.org structured data.
   - Spread guide pages (`/[locale]/spreads/[slug]`).
   - Dynamic `sitemap.xml` and `robots.txt`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4, Vanilla CSS variables, Glassmorphism
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **State Management**: Zustand
- **Database & ORM**: PostgreSQL, Prisma ORM
- **AI Inference**: Anthropic Claude SDK (`@anthropic-ai/sdk`)
- **Payments**: Stripe Checkout & Webhooks
- **Testing**: Vitest

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd "Tarot Card Reading"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required keys:
```env
# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-api03-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"

# Database (Postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/tarot"
DIRECT_URL="postgresql://user:password@localhost:5432/tarot"

# Stripe Billing
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
*(Note: If `ANTHROPIC_API_KEY` is omitted, the app automatically runs in high-fidelity simulated streaming mode for immediate testing).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Unit Tests

Run the Vitest test suite covering the Cryptographic RNG, Credit Ledger, Prompt Builder, and Safety Guardrails:
```bash
npm test
```

Test coverage includes:
- `tests/rng.test.ts`: Zero duplicate card draws across 1,000 spreads, 50/50 reversal statistical distribution over 10,000 trials, and out-of-bounds guards.
- `tests/creditLedger.test.ts`: Atomic credit deductions, balance priority, daily streak increment, and idempotency key deduplication.
- `tests/promptBuilder.test.ts`: Persona tone adaptation, structural relationship computation, and multilingual prompt injection.
- `tests/safetyGuardrails.test.ts`: Multilingual crisis and self-harm detection.

---

## 📦 Building for Production

```bash
npm run build
npm run start
```

---

## 📜 Public Domain Card Artwork Attribution
The 78 card designs are based on the original 1909 Rider-Waite-Smith tarot deck illustrated by Pamela Colman Smith under Arthur Edward Waite. Because it was published in 1909 and Pamela Colman Smith passed away in 1951, the original artwork is in the **Public Domain worldwide**.
