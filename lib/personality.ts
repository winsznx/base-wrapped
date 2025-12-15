/**
 * Personality and Archetype System for Base Wrapped.
 * Assigns fun onchain personality types based on transaction patterns.
 */

// Personality Types
export type PersonalityType =
    | 'builder'
    | 'defi_degen'
    | 'nft_collector'
    | 'bridge_nomad'
    | 'gas_wizard'
    | 'meme_lord'
    | 'early_adopter'
    | 'whale'
    | 'social_butterfly'
    | 'diamond_hands'
    | 'explorer'
    | 'power_user'
    | 'og';

export interface Personality {
    type: PersonalityType;
    title: string;
    description: string;
    emoji: string;
    color: string;
}

// Personality definitions
export const PERSONALITIES: Record<PersonalityType, Omit<Personality, 'type'>> = {
    builder: {
        title: 'The Builder',
        description: 'You shipped on Base. Contract deployer, protocol creator. Legendary.',
        emoji: 'Hammer',
        color: '#FF6B35',
    },
    defi_degen: {
        title: 'DeFi Degen',
        description: 'You live for the swap. DEXes are your second home.',
        emoji: 'TrendingUp',
        color: '#00D395',
    },
    nft_collector: {
        title: 'NFT Collector',
        description: 'Your wallet is a gallery. You collect art like breathing.',
        emoji: 'Image',
        color: '#FF6B6B',
    },
    bridge_nomad: {
        title: 'Bridge Nomad',
        description: 'Chains can\'t hold you. You roam freely across networks.',
        emoji: 'MoveHorizontal',
        color: '#9B59B6',
    },
    gas_wizard: {
        title: 'Gas Wizard',
        description: 'You time your txs perfectly. Efficiency is your superpower.',
        emoji: 'Zap',
        color: '#F39C12',
    },
    meme_lord: {
        title: 'Meme Lord',
        description: 'DEGEN, BRETT, TOSHI — you ride every wave.',
        emoji: 'Laugh',
        color: '#2ECC71',
    },
    early_adopter: {
        title: 'Early Adopter',
        description: 'You were here before it was cool. OG status earned.',
        emoji: 'Sunrise',
        color: '#3498DB',
    },
    whale: {
        title: 'Whale Watcher',
        description: 'Big moves, big volume. The chain notices when you swim.',
        emoji: 'Anchor',
        color: '#1ABC9C',
    },
    social_butterfly: {
        title: 'Social Butterfly',
        description: 'Farcaster, friend.tech — you connect communities.',
        emoji: 'MessagesSquare',
        color: '#E91E63',
    },
    diamond_hands: {
        title: 'Diamond Hands',
        description: 'Few tokens, many holds. You don\'t panic sell.',
        emoji: 'Gem',
        color: '#00BCD4',
    },
    explorer: {
        title: 'Base Explorer',
        description: 'You try everything. Curious mind, diverse portfolio.',
        emoji: 'Compass',
        color: '#0052FF',
    },
    power_user: {
        title: 'Power User',
        description: '1000+ transactions. You live onchain. Base is home.',
        emoji: 'Trophy',
        color: '#FFD700',
    },
    og: {
        title: 'OG',
        description: 'You were on Base before 2024. Ancient wisdom, early vibes.',
        emoji: 'Crown',
        color: '#4169E1',
    },
};

// Meme tokens to detect
const MEME_TOKENS = [
    'degen', 'brett', 'toshi', 'normie', 'mochi', 'crash',
    'doginme', 'keycat', 'basenji', 'higher'
];

// Bridge contracts
const BRIDGE_CONTRACTS = [
    '0x4200000000000000000000000000000000000010', // L2 Standard Bridge
    '0x49048044d57e1c92a77f79988d21fa8faf74e97e', // Base Bridge
];

// DEX/DeFi contracts
const DEFI_CONTRACTS = [
    '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // Uniswap
    '0x2626664c2603336e57b271c5c0b26f421741e481', // Uniswap V3
    '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43', // Aerodrome
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Uniswap Universal Router
    '0x1111111254fb6c44bac0bed2854e76f90643097d', // 1inch
];

// Social contracts
const SOCIAL_CONTRACTS = [
    '0xec8e5342b19977b4ef8892e02d8dbafc80bd1f0', // friend.tech
];

interface PersonalityInput {
    totalTransactions: number;
    nftsMinted: number;
    nftsReceived: number;
    avgGasPerTx: string;
    firstTxDate: string;
    topDapps: Array<{ name: string; address: string; count: number }>;
    topTokens: Array<{ name: string; symbol: string; count: number }>;
    uniqueContractsInteracted: number;
    totalValueSentEth: string;
    contractsDeployed?: number; // Builder detection
}

export function determinePersonality(input: PersonalityInput): Personality {
    const {
        totalTransactions,
        nftsMinted,
        nftsReceived,
        avgGasPerTx,
        firstTxDate,
        topDapps,
        topTokens,
        uniqueContractsInteracted,
        totalValueSentEth,
        contractsDeployed = 0,
    } = input;

    // Calculate scores for each personality
    const scores: Record<PersonalityType, number> = {
        builder: 0,
        defi_degen: 0,
        nft_collector: 0,
        bridge_nomad: 0,
        gas_wizard: 0,
        meme_lord: 0,
        early_adopter: 0,
        whale: 0,
        social_butterfly: 0,
        diamond_hands: 0,
        explorer: 0,
        power_user: 0,
        og: 0,
    };

    // BUILDER - Deployed contracts (HIGHEST PRIORITY - they SHIPPED)
    if (contractsDeployed >= 1) scores.builder += 100; // Any deployment = builder
    if (contractsDeployed >= 3) scores.builder += 50; // Multiple deployments = extra credit
    if (contractsDeployed >= 10) scores.builder += 50; // Prolific builder

    // DeFi Degen - High DEX activity
    const defiTxs = topDapps.filter(d =>
        DEFI_CONTRACTS.some(c => d.address.toLowerCase() === c.toLowerCase())
    ).reduce((sum, d) => sum + d.count, 0);
    if (defiTxs > totalTransactions * 0.4) scores.defi_degen += 50;
    if (defiTxs > 50) scores.defi_degen += 30;

    // NFT Collector - High NFT activity
    const totalNfts = nftsMinted + nftsReceived;
    if (totalNfts >= 10) scores.nft_collector += 50;
    if (nftsMinted >= 5) scores.nft_collector += 30;

    // Bridge Nomad - Bridge usage
    const bridgeTxs = topDapps.filter(d =>
        BRIDGE_CONTRACTS.some(c => d.address.toLowerCase() === c.toLowerCase())
    ).reduce((sum, d) => sum + d.count, 0);
    if (bridgeTxs >= 5) scores.bridge_nomad += 50;
    if (bridgeTxs >= 10) scores.bridge_nomad += 30;

    // Gas Wizard - Low avg gas (Must have active history)
    const avgGas = parseFloat(avgGasPerTx);
    if (avgGas < 0.0005 && totalTransactions > 10) scores.gas_wizard += 40; // Reduced from 50
    if (avgGas < 0.0001 && totalTransactions > 20) scores.gas_wizard += 30;

    // Meme Lord - Trades meme tokens
    const memeTokenCount = topTokens.filter(t =>
        MEME_TOKENS.some(m => t.symbol.toLowerCase().includes(m) || t.name.toLowerCase().includes(m))
    ).length;
    if (memeTokenCount >= 3) scores.meme_lord += 60; // Boosted
    if (memeTokenCount >= 1) scores.meme_lord += 30;

    // Early Adopter - Active before mid-2025
    const firstTx = new Date(firstTxDate);
    const cutoffDate = new Date('2025-06-01');
    if (firstTx < cutoffDate) scores.early_adopter += 40;
    if (firstTx < new Date('2025-03-01')) scores.early_adopter += 20;

    // OG - Active before 2024 (HUGE)
    if (firstTx < new Date('2024-01-01')) scores.og += 150; // Guaranteed win if OG
    if (firstTx < new Date('2023-09-01')) scores.og += 50;

    // Whale - High volume
    const volumeEth = parseFloat(totalValueSentEth);
    if (volumeEth > 10) scores.whale += 60;
    if (volumeEth > 1) scores.whale += 20;

    // Social Butterfly - Social dApps
    const socialTxs = topDapps.filter(d =>
        SOCIAL_CONTRACTS.some(c => d.address.toLowerCase() === c.toLowerCase()) ||
        d.name.toLowerCase().includes('friend') ||
        d.name.toLowerCase().includes('farcaster')
    ).reduce((sum, d) => sum + d.count, 0);
    if (socialTxs >= 10) scores.social_butterfly += 60;
    if (socialTxs >= 5) scores.social_butterfly += 30;

    // Diamond Hands - Few unique tokens, many txs
    if (topTokens.length <= 5 && totalTransactions > 50) {
        scores.diamond_hands += 50;
    }

    // Explorer - High contract diversity (Easier to get)
    if (uniqueContractsInteracted > 10) scores.explorer += 40;
    if (uniqueContractsInteracted > 30) scores.explorer += 40;
    if (uniqueContractsInteracted > 50) scores.explorer += 30;

    // Power User - High transaction count
    if (totalTransactions >= 1000) scores.power_user += 100;
    if (totalTransactions >= 500) scores.power_user += 50;
    if (totalTransactions >= 100) scores.power_user += 30;

    // Find highest scoring personality
    let maxScore = 0;
    let topType: PersonalityType = 'explorer';
    for (const [type, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            topType = type as PersonalityType;
        }
    }

    return {
        type: topType,
        ...PERSONALITIES[topType],
    };
}

// Milestone/Badge System
export interface Milestone {
    id: string;
    title: string;
    description: string;
    emoji: string;
    achieved: boolean;
    achievedDate?: string;
}

export function calculateMilestones(input: {
    totalTransactions: number;
    nftsMinted: number;
    totalValueSentEth: string;
    firstTxDate: string;
    uniqueContractsInteracted: number;
    busyDaysCount: number;
}): Milestone[] {
    const milestones: Milestone[] = [];

    // Century Club - 100+ txs
    milestones.push({
        id: 'century_club',
        title: 'Century Club',
        description: '100 transactions on Base',
        emoji: 'Award',
        achieved: input.totalTransactions >= 100,
    });

    // First Mint - Any NFT mint
    milestones.push({
        id: 'first_mint',
        title: 'First Mint',
        description: 'Minted your first NFT',
        emoji: 'Paintbrush',
        achieved: input.nftsMinted >= 1,
    });

    // Whale Watch - $10K+ volume
    const volume = parseFloat(input.totalValueSentEth);
    milestones.push({
        id: 'whale_watch',
        title: 'Whale Watch',
        description: 'Moved 10+ ETH on Base',
        emoji: 'Anchor',
        achieved: volume >= 10,
    });

    // Early Bird - Active before June
    const firstTx = new Date(input.firstTxDate);
    milestones.push({
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Started before June 2025',
        emoji: 'Sunrise',
        achieved: firstTx < new Date('2025-06-01'),
    });

    // Protocol Explorer - 20+ unique contracts
    milestones.push({
        id: 'protocol_explorer',
        title: 'Protocol Explorer',
        description: 'Interacted with 20+ protocols',
        emoji: 'Compass',
        achieved: input.uniqueContractsInteracted >= 20,
    });

    // Power User - 10+ busy days
    milestones.push({
        id: 'power_user',
        title: 'Power User',
        description: '10+ days with 5+ transactions',
        emoji: 'Zap',
        achieved: input.busyDaysCount >= 10,
    });

    return milestones;
}
