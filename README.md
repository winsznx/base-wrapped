# Base Wrapped 2.0 🔵

**Your 2025 Onchain Year in Review**

Base Wrapped is a cinematic, story-driven personalized experience for Base users. Inspired by Spotify Wrapped, it aggregates onchain data to generate a 15-slide interactive story, revealing a user's transaction history, top dApps, improved stats, and unique "Onchain Personality".

![Base Wrapped Demo](/hero.png)

## 🚀 Key Features

### 🎬 Cinematic Story Flow
We moved beyond static dashboards. The experience is delivered as a sequence of immersive slides:
- **Origin Story**: Calculates the exact day a user joined Base.
- **Percentile Rankings**: Compares user stats (Transactions, Gas, Volume) against the entire ecosystem.
- **Streaks**: Gamified tracking of active days and longest streaks.
- **The Builder Reveal**: Special "YOU SHIPPED" slide for contract deployers.
- **Final Reveal**: A sharable "Personality Card" summarizing the year.

### 🎨 Premium Animations & UI
- **Odometer Counters**: Custom `CountUp` component for smooth number transitions.
- **Progress Rings**: SVG-based circular progress indicators for percentiles.
- **Confetti**: Canvas-based particle system for celebratory moments.
- **Lucide Icons**: Professional, consistent iconography throughout the UI.
- **Dynamic Themes**: Slide backgrounds adapt based on content (e.g., "Gas Wizard" gets a gold/electric theme).

### 🧠 Onchain Personality System
A sophisticated scoring engine assigns one of 13 archetypes based on behavior:
- **The Builder** (Deployed contracts)
- **OG** (First tx before 2024)
- **Gas Wizard** (Low avg gas, high efficiency)
- **Meme Lord** (High interaction with specific meme tokens)
- **NFT Collector** (High transfer/mint count)
- **Bridge Nomad** (High bridge usage)
- **Explorer** (Interact with diverse contracts)

### � Viral Sharing
- **Dynamic OG Images**: `app/api/og` generates a custom image on-the-fly with the user's Name, Rank, and Personality.
- **Warpcast Integration**: "Share on Warpcast" button pre-fills a cast with the dynamic link and a celebratory message.
- **Farcaster Frame Compatible**: Designed to work seamlessly within Farcaster frames.

---

## 🏗 Technical Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (Zero runtime overhead, optimized animations)
- **Icons**: Lucide React
- **Animations**: Framer Motion principles (custom lightweight implementation)

### Project Structure
```bash
├── app/
│   ├── api/
│   │   ├── og/             # Open Graph Image Generation (Edge Runtime)
│   │   └── wrapped/        # Core Data Fetching API
│   ├── page.tsx            # Server Component (Metadata + Logic)
│   └── layout.tsx          # App Shell + Fonts (Space Grotesk)
├── components/
│   ├── HomeClient.tsx      # Client-side Entry Point
│   ├── WrappedStats.tsx    # Main Story Engine (Slide Logic)
│   └── ui/                 # Shared Components (Confetti, CountUp, etc.)
├── lib/
│   ├── stats.ts            # Data Aggregation & Processing
│   ├── basescan.ts         # Routescan API Integration
│   └── personality.ts      # Scoring Engine & Archetype Definitions
└── public/                 # Static Assets
```

### Data Pipeline
1.  **Ingestion**: `lib/basescan.ts` fetches raw transaction history from **Routescan API**.
2.  **Processing**: `lib/stats.ts` aggregates data:
    *   Filters known contracts (Uniswap, Aerodrome, etc.).
    *   Calculates gas spent (Wei -> ETH -> USD).
    *   Identifies contract deployments.
3.  **Scoring**: `lib/personality.ts` analyzes the aggregated stats to compute the "Builder Score" and assign a "Personality".
4.  **Presentation**: `WrappedStats.tsx` receives the processed JSON and renders the appropriate slides.

---

## 🛠 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/winsznx/base-wrapped.git
cd base-wrapped
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Required for onchain data fetching (if using specific providers)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_key

# Optional: Talent Protocol for identity/socials
TALENT_API_KEY=your_talent_key

# Base URL for OG image generation (Localhost for dev)
NEXT_PUBLIC_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧪 API Documentation

### `GET /api/wrapped`
Fetches the wrapped stats for a given address.

**Query Params:**
- `address`: The Ethereum address (0x...) to fetch stats for.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTransactions": 142,
    "personality": {
      "type": "builder",
      "title": "The Builder",
      "emoji": "Hammer"
    },
    "percentile": {
      "overall": 5.2
    }
    // ...other stats
  }
}
```

### `GET /api/og`
Generates a dynamic Open Graph image.

**Query Params:**
- `nm`: Display Name
- `p`: Personality Title
- `tx`: Transaction Count
- `pct`: Percentile Rank
- `color`: Personality Theme Color

---

## 🤝 Contributing

1.  Fork the repo
2.  Create a feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit changes
4.  Push to branch
5.  Open a Pull Request

## 📄 License
MIT © 2025 Base Wrapped
