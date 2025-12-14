const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration for Base Wrapped - Your 2025 Onchain Year in Review.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Base Wrapped", 
    subtitle: "Your 2025 Onchain Year in Review", 
    description: "Discover your onchain story on Base. See your transaction count, gas spent, top dApps, NFTs minted, and more!",
    screenshotUrls: [`${ROOT_URL}/screenshot-wrapped.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["base", "wrapped", "onchain", "2025", "stats", "recap"],
    heroImageUrl: `${ROOT_URL}/hero.png`, 
    tagline: "Your Year on Base, Unwrapped",
    ogTitle: "Base Wrapped 2025",
    ogDescription: "Discover your onchain story on Base. See your transaction count, gas spent, top dApps and more!",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;
