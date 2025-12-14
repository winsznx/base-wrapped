/**
 * Talent Protocol API service for fetching builder reputation data.
 * @see https://docs.talentprotocol.com/docs/developers/talent-api/api-reference
 * 
 * Fetches: Builder Score, Profile, Socials, Credentials, Accounts, Projects
 */

const TALENT_API_URL = 'https://api.talentprotocol.com';

export interface BuilderScore {
    score: number;
    last_calculated_at: string;
    calculating_score: boolean;
}

export interface Credential {
    slug: string;
    name: string;
    category: string;
    points: number;
    max_points: number;
    value: string | number;
}

export interface TalentProfile {
    id: string;
    display_name: string;
    bio: string;
    image_url: string;
    verified: boolean;
    human_checkmark: boolean;
    location?: string;
    tags?: string[];
}

export interface Social {
    source: string;
    name: string;
    profile_url: string;
    followers?: number;
    following?: number;
}

export interface Account {
    id: string;
    wallet?: string;
    source: string;
    verified: boolean;
    profile_url?: string;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
    description: string;
    url: string;
    logo_url?: string;
    role: 'creator' | 'contributor';
    verified: boolean;
}

export interface BuilderData {
    score: number | null;
    profile: TalentProfile | null;
    socials: {
        farcaster?: { username: string; followers: number };
        twitter?: { username: string; followers: number };
        github?: { username: string; repos?: number };
        lens?: { handle: string };
    };
    credentials: Credential[];
    breakdown: {
        github: number;
        twitter: number;
        onchain: number;
        farcaster: number;
        identity: number;
        other: number;
    };
    topCredentials: Credential[];
    accounts: Account[];
    projects: Project[];
    totalDataPoints: number;
}

async function fetchFromTalent<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
    const apiKey = process.env.TALENT_API_KEY;

    if (!apiKey) {
        console.warn('No TALENT_API_KEY found - Talent Protocol data will not be fetched');
        return null;
    }

    const url = new URL(`${TALENT_API_URL}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    console.log(`Calling Talent Protocol API: ${endpoint}`);

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'X-API-KEY': apiKey,
            },
        });

        if (!response.ok) {
            console.warn(`Talent API returned ${response.status}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error('Talent Protocol API error:', error);
        return null;
    }
}

/**
 * Get Builder Score for a wallet address
 */
export async function getBuilderScore(wallet: string): Promise<BuilderScore | null> {
    const response = await fetchFromTalent<{ score: BuilderScore }>('/score', {
        id: wallet,
        scorer_slug: 'builder_score',
    });

    return response?.score || null;
}

/**
 * Get Builder Score for a Farcaster FID
 */
export async function getFarcasterScore(fid: number): Promise<BuilderScore | null> {
    const response = await fetchFromTalent<{ scores: { fid: number; score: number }[] }>('/farcaster/scores', {
        fids: fid.toString(),
    });

    if (response?.scores && response.scores.length > 0) {
        return {
            score: response.scores[0].score,
            last_calculated_at: new Date().toISOString(),
            calculating_score: false,
        };
    }

    return null;
}

/**
 * Get credentials breakdown for a wallet address
 */
export async function getCredentials(wallet: string): Promise<Credential[]> {
    const response = await fetchFromTalent<{ credentials: Credential[] }>('/credentials', {
        id: wallet,
        scorer_slug: 'builder_score',
    });

    return response?.credentials || [];
}

/**
 * Get profile data for a wallet address
 */
export async function getProfile(wallet: string): Promise<TalentProfile | null> {
    const response = await fetchFromTalent<{ profile: TalentProfile }>('/profile', {
        id: wallet,
    });

    return response?.profile || null;
}

/**
 * Get social accounts linked to wallet
 */
export async function getSocials(wallet: string): Promise<Social[]> {
    const response = await fetchFromTalent<{ socials: Social[] }>('/socials', {
        id: wallet,
    });

    return response?.socials || [];
}

/**
 * Get connected accounts for a wallet
 */
export async function getAccounts(wallet: string): Promise<Account[]> {
    const response = await fetchFromTalent<{ accounts: Account[] }>('/accounts', {
        id: wallet,
    });

    return response?.accounts || [];
}

/**
 * Get projects created by or contributed to by the wallet
 */
export async function getProjects(wallet: string): Promise<Project[]> {
    const response = await fetchFromTalent<{ projects: Project[] }>('/projects', {
        id: wallet,
    });

    return response?.projects || [];
}

/**
 * Get all builder data for a wallet - score, profile, socials, credentials, accounts, projects
 */
export async function getBuilderData(wallet: string): Promise<BuilderData> {
    // Fetch all data in parallel
    const [score, credentials, profile, socials, accounts, projects] = await Promise.all([
        getBuilderScore(wallet),
        getCredentials(wallet),
        getProfile(wallet),
        getSocials(wallet),
        getAccounts(wallet),
        getProjects(wallet),
    ]);

    // Parse socials
    const parsedSocials: BuilderData['socials'] = {};

    socials.forEach((social) => {
        const source = social.source?.toLowerCase() || social.name?.toLowerCase() || '';

        if (source.includes('farcaster')) {
            parsedSocials.farcaster = {
                username: social.name || '',
                followers: social.followers || 0,
            };
        } else if (source.includes('twitter') || source.includes('x.com')) {
            parsedSocials.twitter = {
                username: social.name || '',
                followers: social.followers || 0,
            };
        } else if (source.includes('github')) {
            parsedSocials.github = {
                username: social.name || '',
            };
        } else if (source.includes('lens')) {
            parsedSocials.lens = {
                handle: social.name || '',
            };
        }
    });

    // Calculate breakdown from credentials
    const breakdown = {
        github: 0,
        twitter: 0,
        onchain: 0,
        farcaster: 0,
        identity: 0,
        other: 0,
    };

    credentials.forEach((cred) => {
        const category = cred.category?.toLowerCase() || '';
        const slug = cred.slug?.toLowerCase() || '';

        if (category.includes('github') || slug.includes('github')) {
            breakdown.github += cred.points || 0;
        } else if (category.includes('twitter') || category.includes('x_') || slug.includes('twitter')) {
            breakdown.twitter += cred.points || 0;
        } else if (category.includes('onchain') || category.includes('wallet') || slug.includes('transaction')) {
            breakdown.onchain += cred.points || 0;
        } else if (category.includes('farcaster') || slug.includes('farcaster')) {
            breakdown.farcaster += cred.points || 0;
        } else if (category.includes('identity') || slug.includes('passport') || slug.includes('verified')) {
            breakdown.identity += cred.points || 0;
        } else {
            breakdown.other += cred.points || 0;
        }
    });

    // Get top credentials by points
    const topCredentials = [...credentials]
        .filter(c => c.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);

    // Calculate total data points
    const totalDataPoints = credentials.reduce((sum, c) => sum + (c.points > 0 ? 1 : 0), 0);

    console.log(`Builder data for ${wallet}:`, {
        score: score?.score,
        farcaster: parsedSocials.farcaster?.username,
        twitter: parsedSocials.twitter?.username,
        github: parsedSocials.github?.username,
        profileName: profile?.display_name,
        accountsCount: accounts.length,
        projectsCount: projects.length,
    });

    return {
        score: score?.score || null,
        profile,
        socials: parsedSocials,
        credentials,
        breakdown,
        topCredentials,
        accounts,
        projects,
        totalDataPoints,
    };
}
