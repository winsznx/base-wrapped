/**
 * Neynar API client for Farcaster data integration.
 * Provides methods to fetch Farcaster profiles, social stats, and casting activity.
 */

const NEYNAR_API_BASE = 'https://api.neynar.com/v2';

interface NeynarUser {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    custody_address: string;
    profile: {
        bio: {
            text: string;
        };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
        eth_addresses: string[];
        sol_addresses: string[];
    };
    power_badge: boolean;
}

interface NeynarUserResponse {
    [address: string]: NeynarUser[];
}

export interface FarcasterProfile {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    bio: string;
    followerCount: number;
    followingCount: number;
    hasPowerBadge: boolean;
    verifiedAddresses: string[];
}

/**
 * Get Neynar API key from environment
 */
function getApiKey(): string | null {
    return process.env.NEYNAR_API_KEY || null;
}

/**
 * Fetch Farcaster profile by wallet address.
 * Returns null if no Farcaster account is linked to this address.
 */
export async function getFarcasterProfile(walletAddress: string): Promise<FarcasterProfile | null> {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.log('Neynar API key not configured, skipping Farcaster lookup');
        return null;
    }

    try {
        const normalizedAddress = walletAddress.toLowerCase();
        const url = `${NEYNAR_API_BASE}/farcaster/user/bulk-by-address?addresses=${normalizedAddress}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Neynar API error:', response.status, response.statusText);
            return null;
        }

        const data: NeynarUserResponse = await response.json();

        // The response is keyed by address
        const users = data[normalizedAddress];
        if (!users || users.length === 0) {
            console.log('No Farcaster account found for address:', normalizedAddress);
            return null;
        }

        // Take the first user (primary account for this address)
        const user = users[0];

        return {
            fid: user.fid,
            username: user.username,
            displayName: user.display_name,
            pfpUrl: user.pfp_url,
            bio: user.profile?.bio?.text || '',
            followerCount: user.follower_count,
            followingCount: user.following_count,
            hasPowerBadge: user.power_badge,
            verifiedAddresses: [
                ...(user.verified_addresses?.eth_addresses || []),
                ...(user.verified_addresses?.sol_addresses || []),
            ],
        };
    } catch (error) {
        console.error('Error fetching Farcaster profile:', error);
        return null;
    }
}

/**
 * Get user's casting stats for the year.
 * Returns cast count and top channels.
 */
export async function getCastingStats(fid: number): Promise<{
    totalCasts: number;
    topChannels: string[];
} | null> {
    const apiKey = getApiKey();
    if (!apiKey) {
        return null;
    }

    try {
        // Fetch user's recent casts (up to 150 for channel analysis)
        const url = `${NEYNAR_API_BASE}/farcaster/feed/user/casts?fid=${fid}&limit=150`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Neynar casts API error:', response.status);
            return null;
        }

        const data = await response.json();
        const casts = data.casts || [];

        // Filter casts from 2025
        const currentYear = new Date().getFullYear();
        const castsThisYear = casts.filter((cast: { timestamp: string }) => {
            const castYear = new Date(cast.timestamp).getFullYear();
            return castYear === currentYear;
        });

        // Count channels
        const channelCounts: Record<string, number> = {};
        castsThisYear.forEach((cast: { channel?: { id: string } }) => {
            if (cast.channel?.id) {
                channelCounts[cast.channel.id] = (channelCounts[cast.channel.id] || 0) + 1;
            }
        });

        // Get top 5 channels
        const topChannels = Object.entries(channelCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([channel]) => channel);

        return {
            totalCasts: castsThisYear.length,
            topChannels,
        };
    } catch (error) {
        console.error('Error fetching casting stats:', error);
        return null;
    }
}

/**
 * Get channels the user follows.
 */
export async function getUserChannels(fid: number): Promise<string[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        return [];
    }

    try {
        const url = `${NEYNAR_API_BASE}/farcaster/user/channels?fid=${fid}&limit=50`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        const channels = data.channels || [];

        return channels.map((ch: { id: string }) => ch.id);
    } catch (error) {
        console.error('Error fetching user channels:', error);
        return [];
    }
}

/**
 * Fetch complete Farcaster data for a wallet address.
 * Combines profile lookup with casting stats.
 */
export async function getFarcasterData(walletAddress: string): Promise<{
    profile: FarcasterProfile;
    castingStats?: {
        totalCasts: number;
        topChannels: string[];
    };
    followedChannels?: string[];
} | null> {
    const profile = await getFarcasterProfile(walletAddress);

    if (!profile) {
        return null;
    }

    // Fetch additional stats in parallel
    const [castingStats, followedChannels] = await Promise.all([
        getCastingStats(profile.fid),
        getUserChannels(profile.fid),
    ]);

    return {
        profile,
        castingStats: castingStats || undefined,
        followedChannels: followedChannels.length > 0 ? followedChannels : undefined,
    };
}
