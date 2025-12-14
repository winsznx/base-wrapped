const ROOT_URL = 'https://base-wrapped-nine.vercel.app';

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
  frame: {
    version: "1",
    name: "Base Wrapped",
    subtitle: "Your 2025 Onchain Year in Review",
    description: "Discover your onchain story on Base. See your transaction count, gas spent, top dApps, NFTs minted, and more!",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["base"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Your Year on Base, Unwrapped",
    ogTitle: "Base Wrapped 2025",
    ogDescription: "Discover your onchain story on Base. See your transaction count, gas spent, top dApps and more!",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
    imageUrl: `${ROOT_URL}/og-image.png`,
    buttonTitle: "Get My Wrapped",
    castShareUrl: "https://warpcast.com/~/compose?text=Check%20out%20my%20Base%20Wrapped%202025&embeds[]=https://base-wrapped-nine.vercel.app"
  },
} as const;

// For backwards compatibility
export const { frame: miniapp } = minikitConfig;
