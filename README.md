# Base Wrapped 🔵

Your 2025 Year on Base — A Spotify Wrapped-style experience for your onchain activity.

## Features

### Core Stats
- **Transaction Summary** — Total transactions, success rate
- **Gas Analytics** — ETH spent, USD equivalent
- **dApp Rankings** — Your top 5 protocols
- **NFT Activity** — Minted, collected, traded
- **Token Insights** — Most traded tokens
- **Time Analysis** — Peak days, early bird/night owl stats

### Personality System
10 onchain archetypes based on your activity:
- DeFi Degen, NFT Collector, Bridge Nomad, Gas Wizard
- Meme Lord, Early Adopter, Whale, Social Butterfly
- Diamond Hands, Explorer

### Milestone Badges
- Century Club (100+ txs)
- First Mint (NFT minted)
- Whale Watch (10+ ETH volume)
- Early Bird (Before June 2025)
- Protocol Explorer (20+ protocols)
- Power User (10+ busy days)

### Storytelling Slides
- **First Transaction** — "Where it all began..."
- **Peak Day** — Your wildest activity day
- **Personality Reveal** — Your onchain archetype
- **Milestones** — Earned badges

### Integrations
- **Talent Protocol** — Builder Score + credentials
- **Routescan API** — Transaction history
- **Farcaster** — Share to Warpcast

## Tech Stack
- Next.js 15 + TypeScript
- OnchainKit (MiniKit)
- Farcaster Mini App
- Space Grotesk typography
- Base brand guidelines

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/winsznx/base-wrapped.git
cd base-wrapped
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```

Required:
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_key
NEXT_PUBLIC_URL=http://localhost:3000
TALENT_API_KEY=your_talent_protocol_key
```

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
```bash
vercel --prod
```

## Project Structure
```
├── app/
│   ├── page.tsx           # Landing + intro animation
│   ├── about/             # About page
│   └── api/wrapped/       # Stats API endpoint
├── components/
│   ├── WrappedStats.tsx   # 15 slide story
│   └── IntroAnimation.tsx # 3D intro
├── lib/
│   ├── stats.ts           # Stats calculation
│   ├── personality.ts     # Archetype system
│   ├── basescan.ts        # Routescan API
│   └── talentprotocol.ts  # Builder Score API
└── public/
    └── base-square.svg    # Official Base logo
```

## Data Sources
- **Routescan** — Transactions, gas, NFTs (free, no key needed)
- **Talent Protocol** — Builder Score, socials, credentials

## License
MIT

---

Built with 💙 on Base
