const ROOT_URL = 'https://base-wrapped-nine.vercel.app';

// Neynar Client ID for managed webhook - handles notification tokens automatically
// Get this from https://dev.neynar.com/app
const NEYNAR_CLIENT_ID = process.env.NEYNAR_CLIENT_ID || process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

/**
 * MiniApp configuration for Base Wrapped - Your 2025 Onchain Year in Review.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjEzNzEyNTQsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgxYjI4MjNlNjA4NTlDZDY0NzY5Nzg0NjREN2IzYzk1MUI1ZmNmODQzIn0",
    payload: "eyJkb21haW4iOiJiYXNlLXdyYXBwZWQtbmluZS52ZXJjZWwuYXBwIn0",
    signature: "+dkbEgQmOQyS9Z1othiAEsr78KvtH5tv2nOsG2KhGHRL0ocdDxH08qEsfGqoPn5kLsMI9pRVMMjo21zHD2ZWbBs="
  },
  miniapp: {
    version: "1",
    name: "Base Wrapped",
    subtitle: "2025 Onchain Year in Review",
    description: "Discover your onchain story on Base. See your transaction count, gas spent, top dApps, NFTs minted, and more!",
    iconUrl: `${ROOT_URL}/icon.png`,
    homeUrl: ROOT_URL,
    imageUrl: `${ROOT_URL}/og-image.png`,
    buttonTitle: "Get My Wrapped",
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF",
    // Use Neynar's managed webhook for notification handling
    // Falls back to custom webhook if client ID not set
    webhookUrl: NEYNAR_CLIENT_ID
      ? `https://api.neynar.com/f/app/${NEYNAR_CLIENT_ID}/event`
      : `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["base", "wrapped", "onchain", "2025"],
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Your Year on Base, Unwrapped",
    ogTitle: "Base Wrapped 2025",
    ogDescription: "Discover your onchain story on Base. See your transaction count, gas spent, top dApps and more!",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
    builderCode: "bc_qjhuhb9o",
  },
} as const;

// For backward compatibility with frame
export const { miniapp: frame } = minikitConfig;
