/**
 * Stats calculation service for Base Wrapped.
 * Processes raw transaction data into fun wrapped stats.
 */

import {
    getTransactions,
    getInternalTransactions,
    getTokenTransfers,
    getNFTTransfers,
    getERC1155Transfers,
    getContractCreations,
    getFirstTransactionDate,
} from './basescan';
import { determinePersonality, calculateMilestones } from './personality';
import { fetchZerionData } from './zerion';

// Known dApp contract addresses on Base (expanded list)
const KNOWN_DAPPS: Record<string, string> = {
    // DEXes
    '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': 'Uniswap',
    '0x2626664c2603336e57b271c5c0b26f421741e481': 'Uniswap V3',
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap Universal Router',
    '0xec7be89e9d109e7e3fec59c222cf297125fefda2': 'Uniswap V3 Factory',
    '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': 'Aerodrome',
    '0x940181a94a35a4569e4529a3cdf79ca2d8f85cb9': 'Aerodrome Router',
    '0x420dd381b31aef6683db6b902084cb0ffece40da': 'Aerodrome Voter',
    '0x1111111254fb6c44bac0bed2854e76f90643097d': '1inch',
    '0x111111125421ca6dc452d289314280a0f8842a65': '1inch V6',
    '0x6131b5fae19ea4f9d964eac0408e4408b66337b5': 'Kyberswap',
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff': '0x Protocol',
    '0x9c12939390052919af3155f41bf4160fd3666a6f': 'Maverick',
    '0x327df1e6de05895d2ab08513aadd9313fe505d86': 'BaseSwap',
    '0xc1e624c810d297fd70ef53b0e08f44fabe468591': 'RocketSwap',
    '0x8c1a3cf8f83074169fe5d7ad50b978e1cd6b37c7': 'SwapBased',
    '0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc': 'Odos',

    // Tokens
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
    '0x4200000000000000000000000000000000000006': 'WETH',
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'DAI',
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': 'USDbC',
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': 'cbETH',
    '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452': 'wstETH',
    '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c': 'rETH',
    '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe': 'HIGHER',
    '0x532f27101965dd16442e59d40670faf5ebb142e4': 'BRETT',
    '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': 'DEGEN',
    '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4': 'TOSHI',

    // Lending
    '0x3e7ef8f50246f725885102e8238cbba33f276747': 'Aave',
    '0xa238dd80c259a72e81d7e4664a9801593f98d1c5': 'Aave Pool',
    '0x46e6b214b524310239732d51387075e0e70970bf': 'Moonwell',
    '0xfbb21d0380bee3312b33c4353c8936a0f13ef26c': 'Compound',
    '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf': 'Seamless',

    // NFT / Social
    '0xec8e5342b19977b4ef8892e02d8dbafc80bd1f0': 'friend.tech',
    '0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4': 'friend.tech V2',
    '0x7777777f279eba3d3ad8f4e708545291a6fdba8b': 'Zora',
    '0x777777c338d93e2c7adf08d102d45ca7cc4ed021': 'Zora Rewards',
    '0x9a26f5433671751c3276a065f57e5a02d2817973': 'Basecamp',
    '0x1d6b183bd47f914f9f1d3208edcf8befd7f84e63': 'Farcaster',
    '0xd4498134211baaf44b4e8a80f4f3e5b4921ff48c': 'Mint.fun',
    '0xe3eb165c9ed6d6d87a59c410c8f30babac44fefd': 'Base App',

    // Bridges
    '0x49048044d57e1c92a77f79988d21fa8faf74e97e': 'Base Bridge',
    '0x3154cf16ccdb4c6d922629664174b904d80f2c35': 'Base Bridge L1',
    '0x866e82a600a1414e583f7f13623f1ac5d58b0afa': 'Stargate',
    '0x50b6ebc2103bfec165949cc946d739d5650d7ae4': 'Hop Protocol',
    '0xaf54be5b6eec24d6bfacf1cce4eaf680a8239398': 'Across',

    // Yield / DeFi
    '0x78a087d713be963bf307b18f2ff8122ef9a63ae9': 'Beefy',
    '0x6b8d3b1a05a73f7f4fb1eff3c3dd0a5d8b1f3f8b': 'Yearn',
    '0xb125e6687d4313864e53df431d5425969c15eb2f': 'Extra Finance',
    '0x9ba021b0a9b958b5e75ce9f6dff97c7ee52cb3e6': 'Socket',

    // Gaming / Other
    '0x8a8f0a43e8fc8d715c00cff1c8fdd9decd8f0aa8': 'Parallel',
    '0x52629961f71c1c2564c5aa22372cb1b9fa9ed39e': 'Layer3',
    '0x1efab7a0dcfbb0b7d9b7f7a7fb4dcd3d28c1f3b2': 'Galxe',
};

// Base App Beta NFT - minted when users register for Base app
const BASE_APP_BETA_NFT = '0xe3eb165c9ed6d6d87a59c410c8f30babac44fefd';

export interface WrappedStats {
    // Basic counts
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;

    // Gas stats
    totalGasSpentWei: string;
    totalGasSpentEth: string;
    avgGasPerTx: string;

    // Volume
    totalValueSentWei: string;
    totalValueSentEth: string;
    totalValueReceivedWei: string;
    totalValueReceivedEth: string;

    // dApp interactions
    topDapps: Array<{ name: string; address: string; count: number; imageUrl?: string }>;
    uniqueContractsInteracted: number;

    // NFTs
    nftsMinted: number;
    nftsReceived: number;
    nftsSent: number;
    uniqueNFTCollections: number;
    topNFTCollections: Array<{ name: string; symbol: string; count: number }>;

    // Tokens
    uniqueTokensTraded: number;
    topTokens: Array<{ name: string; symbol: string; count: number }>;

    // Time-based
    mostActiveMonth: string;
    mostActiveDay: string;
    firstTxDate: string;
    lastTxDate: string;

    // Fun facts
    busyDaysCount: number; // Days with 5+ txs
    earlyBirdTxs: number; // Txs before 6am UTC
    nightOwlTxs: number; // Txs after 10pm UTC

    // Builder Score (Talent Protocol)
    builderScore?: number | null;
    builderScoreBreakdown?: {
        github: number;
        twitter: number;
        onchain: number;
        farcaster: number;
        identity: number;
        other: number;
    };
    // Talent Protocol Socials
    talentProfile?: {
        displayName?: string;
        bio?: string;
        imageUrl?: string;
        verified?: boolean;
        humanCheckmark?: boolean;
    };
    socials?: {
        farcaster?: { username: string; followers: number };
        twitter?: { username: string; followers: number };
        github?: { username: string };
    };
    // Talent Protocol Accounts & Projects
    accounts?: Array<{
        source: string;
        verified: boolean;
    }>;
    projects?: Array<{
        name: string;
        description: string;
        url: string;
        logoUrl?: string;
        role: string;
    }>;
    topCredentials?: Array<{
        name: string;
        category: string;
        points: number;
    }>;

    // Personality System
    personality?: {
        type: string;
        title: string;
        description: string;
        emoji: string;
        color: string;
    };
    milestones?: Array<{
        id: string;
        title: string;
        description: string;
        emoji: string;
        achieved: boolean;
        achievedDate?: string;
    }>;

    // Enhanced stats
    firstTransaction?: {
        hash: string;
        date: string;
        type: string; // 'transfer', 'contract_call', 'bridge', etc.
        value: string;
    };
    peakDay?: {
        date: string;
        txCount: number;
        description: string;
    };
    monthlyBreakdown?: Array<{
        month: string;
        txCount: number;
        topDapp?: string;
    }>;

    // Base App membership
    baseAppJoinDate?: {
        date: string;
        tokenId?: string;
        isEarlyAdopter: boolean; // Beta NFT holders are early adopters
    };

    // Farcaster (Neynar)
    farcaster?: {
        fid: number;
        username: string;
        displayName: string;
        pfpUrl: string;
        bio: string;
        followerCount: number;
        followingCount: number;
        hasPowerBadge: boolean;
        verifiedAddresses: string[];
        totalCasts2025?: number;
        topChannels?: string[];
        followedChannels?: string[];
    };

    // ===== NEW: Story-Driven Stats =====

    // Origin Story
    originStory?: {
        firstEverTxDate: string; // "March 14, 2023"
        firstEverTxHash: string;
        daysOnBase: number; // Total days since first tx
        joinedBefore2024: boolean; // OG status
    };

    // Activity Streaks
    streaks?: {
        longestStreak: number; // Consecutive days with txs
        currentStreak: number;
        activeDays: number; // Total unique days with activity
        activeDaysThisYear: number;
    };

    // Percentile Rankings (makes users feel special)
    percentile?: {
        transactions: number; // "Top X% of Base users"
        gasSpent: number;
        contracts: number;
        overall: number; // Combined ranking
    };

    // Builder Status (huge flex)
    builder?: {
        isBuilder: boolean;
        contractsDeployed: number;
        deployedContracts: Array<{
            address: string;
            hash: string;
            date: string;
        }>;
    };

    // Volume Stats
    volume?: {
        totalBridgedIn: string; // ETH
        totalBridgedOut: string;
        largestSingleTx: {
            hash: string;
            value: string;
            date: string;
        };
        // New Zerion Data
        highestValueSwap?: {
            amountUSD: number;
            tokenSymbol: string;
            date: string;
        };
        totalSwapVolumeUSD?: number;
    };
}

function weiToEth(wei: string): string {
    const ethValue = BigInt(wei) / BigInt(10 ** 18);
    const remainder = BigInt(wei) % BigInt(10 ** 18);
    const decimal = Number(remainder) / (10 ** 18);
    return (Number(ethValue) + decimal).toFixed(6);
}

function formatDate(timestamp: string): string {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function getMonthName(timestamp: string): string {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', { month: 'long' });
}

function getDayName(timestamp: string): string {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', { weekday: 'long' });
}

function getHour(timestamp: string): number {
    return new Date(parseInt(timestamp) * 1000).getUTCHours();
}

/**
 * Calculate activity streaks from transaction timestamps
 */
function calculateStreaks(transactions: Array<{ timeStamp: string }>): {
    longestStreak: number;
    currentStreak: number;
    activeDays: number;
    activeDaysThisYear: number;
} {
    if (transactions.length === 0) {
        return { longestStreak: 0, currentStreak: 0, activeDays: 0, activeDaysThisYear: 0 };
    }

    // Get unique days with activity
    const uniqueDays = new Set<string>();
    const uniqueDays2025 = new Set<string>();
    const year2025Start = new Date('2025-01-01').getTime() / 1000;

    transactions.forEach(tx => {
        const date = new Date(parseInt(tx.timeStamp) * 1000);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        uniqueDays.add(dayKey);

        if (parseInt(tx.timeStamp) >= year2025Start) {
            uniqueDays2025.add(dayKey);
        }
    });

    // Sort days chronologically
    const sortedDays = Array.from(uniqueDays).sort();

    // Calculate streaks
    let longestStreak = 1;
    let currentStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    // Current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDays.has(today) || uniqueDays.has(yesterday)) {
        currentStreak = 1;
        const recentDays = sortedDays.slice(-30).reverse(); // Last 30 days

        for (let i = 1; i < recentDays.length; i++) {
            const currDate = new Date(recentDays[i - 1]);
            const prevDate = new Date(recentDays[i]);
            const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    } else {
        currentStreak = 0;
    }

    return {
        longestStreak,
        currentStreak,
        activeDays: uniqueDays.size,
        activeDaysThisYear: uniqueDays2025.size,
    };
}

/**
 * Estimate percentile ranking based on activity
 * This is an approximation since we don't have global Base stats
 */
function estimatePercentile(txCount: number, gasSpentEth: number, contractsInteracted: number): {
    transactions: number;
    gasSpent: number;
    contracts: number;
    overall: number;
} {
    // Rough percentile curves based on typical Base user activity
    // Higher value = more elite (top 1% = 99)

    const txPercentile = txCount >= 5000 ? 99 :
        txCount >= 1000 ? 95 :
            txCount >= 500 ? 90 :
                txCount >= 100 ? 75 :
                    txCount >= 50 ? 50 :
                        txCount >= 10 ? 25 : 10;

    const gasPercentile = gasSpentEth >= 1 ? 99 :
        gasSpentEth >= 0.1 ? 90 :
            gasSpentEth >= 0.01 ? 70 :
                gasSpentEth >= 0.001 ? 40 : 20;

    const contractPercentile = contractsInteracted >= 100 ? 99 :
        contractsInteracted >= 50 ? 95 :
            contractsInteracted >= 20 ? 80 :
                contractsInteracted >= 10 ? 60 : 30;

    const overall = Math.round((txPercentile + gasPercentile + contractPercentile) / 3);

    return {
        transactions: txPercentile,
        gasSpent: gasPercentile,
        contracts: contractPercentile,
        overall,
    };
}

export async function calculateWrappedStats(address: string): Promise<WrappedStats> {
    const normalizedAddress = address.toLowerCase();

    // Fetch all data in parallel
    const [transactions, _internalTxs, tokenTransfers, nftTransfers, erc1155Transfers, contractCreations, originData, zerionData] = await Promise.all([
        getTransactions(address),
        getInternalTransactions(address),
        getTokenTransfers(address),
        getNFTTransfers(address),
        getERC1155Transfers(address),
        getContractCreations(address),
        getFirstTransactionDate(address),
        fetchZerionData(address),
    ]);

    // All NFTs combined
    const allNFTs = [...nftTransfers, ...erc1155Transfers];

    // Basic counts
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(tx => tx.isError === '0').length;
    const failedTransactions = transactions.filter(tx => tx.isError === '1').length;

    // Gas calculations
    let totalGasSpentWei = BigInt(0);
    transactions.forEach(tx => {
        if (tx.from.toLowerCase() === normalizedAddress) {
            const gasUsed = BigInt(tx.gasUsed);
            const gasPrice = BigInt(tx.gasPrice);
            totalGasSpentWei += gasUsed * gasPrice;
        }
    });

    const avgGasPerTx = totalTransactions > 0
        ? (totalGasSpentWei / BigInt(totalTransactions)).toString()
        : '0';

    // Value calculations
    let totalValueSentWei = BigInt(0);
    let totalValueReceivedWei = BigInt(0);

    transactions.forEach(tx => {
        const value = BigInt(tx.value);
        if (tx.from.toLowerCase() === normalizedAddress) {
            totalValueSentWei += value;
        }
        if (tx.to?.toLowerCase() === normalizedAddress) {
            totalValueReceivedWei += value;
        }
    });

    // dApp interactions
    const contractCounts: Record<string, number> = {};
    transactions.forEach(tx => {
        if (tx.to && tx.to !== '') {
            const addr = tx.to.toLowerCase();
            contractCounts[addr] = (contractCounts[addr] || 0) + 1;
        }
    });

    let topDapps: Array<{ name: string; address: string; count: number; imageUrl?: string }> = [];

    if (zerionData.topDapps && zerionData.topDapps.length > 0) {
        // Use rich Zerion data
        topDapps = zerionData.topDapps.map((d: any) => ({
            name: d.name,
            address: '', // Zerion might not give simple address for complex protocols, optional here
            count: d.interactionCount || 0,
            imageUrl: d.imageUrl
        }));
    } else {
        // Fallback to RPC scanning
        topDapps = Object.entries(contractCounts)
            .map(([address, count]) => ({
                address,
                name: KNOWN_DAPPS[address] || `${address.slice(0, 6)}...${address.slice(-4)}`,
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    // NFT stats
    const nftsMinted = allNFTs.filter(nft =>
        nft.from === '0x0000000000000000000000000000000000000000' &&
        nft.to.toLowerCase() === normalizedAddress
    ).length;

    const nftsReceived = allNFTs.filter(nft =>
        nft.to.toLowerCase() === normalizedAddress &&
        nft.from !== '0x0000000000000000000000000000000000000000'
    ).length;

    const nftsSent = allNFTs.filter(nft =>
        nft.from.toLowerCase() === normalizedAddress
    ).length;

    const nftCollectionCounts: Record<string, { name: string; symbol: string; count: number }> = {};
    allNFTs.forEach(nft => {
        const addr = nft.contractAddress.toLowerCase();
        if (!nftCollectionCounts[addr]) {
            nftCollectionCounts[addr] = { name: nft.tokenName || 'Unknown', symbol: nft.tokenSymbol || '???', count: 0 };
        }
        nftCollectionCounts[addr].count++;
    });

    const topNFTCollections = Object.values(nftCollectionCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Detect Base App Beta NFT (join date)
    const baseAppBetaNft = allNFTs.find(nft =>
        nft.contractAddress.toLowerCase() === BASE_APP_BETA_NFT &&
        nft.to.toLowerCase() === normalizedAddress
    );
    const baseAppJoinDate = baseAppBetaNft ? {
        date: formatDate(baseAppBetaNft.timeStamp),
        tokenId: baseAppBetaNft.tokenID,
        isEarlyAdopter: true,
    } : undefined;

    // Token stats
    const tokenCounts: Record<string, { name: string; symbol: string; count: number }> = {};
    tokenTransfers.forEach(token => {
        const addr = token.contractAddress.toLowerCase();
        if (!tokenCounts[addr]) {
            tokenCounts[addr] = { name: token.tokenName || 'Unknown', symbol: token.tokenSymbol || '???', count: 0 };
        }
        tokenCounts[addr].count++;
    });

    const topTokens = Object.values(tokenCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Time-based stats
    const monthCounts: Record<string, number> = {};
    const dayCounts: Record<string, number> = {};
    const dateCounts: Record<string, number> = {};
    let earlyBirdTxs = 0;
    let nightOwlTxs = 0;

    transactions.forEach(tx => {
        const month = getMonthName(tx.timeStamp);
        const day = getDayName(tx.timeStamp);
        const date = formatDate(tx.timeStamp);
        const hour = getHour(tx.timeStamp);

        monthCounts[month] = (monthCounts[month] || 0) + 1;
        dayCounts[day] = (dayCounts[day] || 0) + 1;
        dateCounts[date] = (dateCounts[date] || 0) + 1;

        if (hour < 6) earlyBirdTxs++;
        if (hour >= 22) nightOwlTxs++;
    });

    const mostActiveMonth = Object.entries(monthCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const mostActiveDay = Object.entries(dayCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const busyDaysCount = Object.values(dateCounts).filter(count => count >= 5).length;

    // First and last tx
    const sortedTxs = [...transactions].sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
    const firstTxDate = sortedTxs.length > 0 ? formatDate(sortedTxs[0].timeStamp) : 'N/A';
    const lastTxDate = sortedTxs.length > 0 ? formatDate(sortedTxs[sortedTxs.length - 1].timeStamp) : 'N/A';

    // First transaction details
    const firstTx = sortedTxs[0];
    const firstTransaction = firstTx ? {
        hash: firstTx.hash,
        date: formatDate(firstTx.timeStamp),
        type: firstTx.to ? 'contract_call' : 'transfer',
        value: weiToEth(firstTx.value),
    } : undefined;

    // Peak day - find the day with most transactions
    const peakDayEntry = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0];
    const peakDay = peakDayEntry ? {
        date: peakDayEntry[0],
        txCount: peakDayEntry[1],
        description: peakDayEntry[1] >= 20 ? 'You went absolutely wild!' :
            peakDayEntry[1] >= 10 ? 'Busy day on Base!' : 'Your most active day',
    } : undefined;

    // Monthly breakdown with top dApp per month
    const monthlyBreakdown = Object.entries(monthCounts)
        .sort((a, b) => {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            return months.indexOf(a[0]) - months.indexOf(b[0]);
        })
        .map(([month, txCount]) => ({ month, txCount, topDapp: topDapps[0]?.name }));

    // Calculate personality
    const personality = determinePersonality({
        totalTransactions,
        nftsMinted,
        nftsReceived,
        avgGasPerTx: weiToEth(avgGasPerTx),
        firstTxDate,
        topDapps,
        topTokens,
        uniqueContractsInteracted: Object.keys(contractCounts).length,
        totalValueSentEth: weiToEth(totalValueSentWei.toString()),
        contractsDeployed: contractCreations.count,
    });

    // Calculate milestones
    const milestones = calculateMilestones({
        totalTransactions,
        nftsMinted,
        totalValueSentEth: weiToEth(totalValueSentWei.toString()),
        firstTxDate,
        uniqueContractsInteracted: Object.keys(contractCounts).length,
        busyDaysCount,
    });

    // Calculate new story-driven stats
    const streaks = calculateStreaks(transactions);
    const percentile = estimatePercentile(
        totalTransactions,
        parseFloat(weiToEth(totalGasSpentWei.toString())),
        Object.keys(contractCounts).length
    );

    // Build origin story
    const originStory = originData ? {
        firstEverTxDate: originData.date,
        firstEverTxHash: originData.hash,
        daysOnBase: Math.floor((Date.now() / 1000 - originData.timestamp) / 86400),
        joinedBefore2024: originData.timestamp < new Date('2024-01-01').getTime() / 1000,
    } : undefined;

    // Build builder status
    const builder = contractCreations.count > 0 ? {
        isBuilder: true,
        contractsDeployed: contractCreations.count,
        deployedContracts: contractCreations.contracts.map(c => ({
            address: c.address,
            hash: c.hash,
            date: formatDate(c.timestamp),
        })),
    } : {
        isBuilder: false,
        contractsDeployed: 0,
        deployedContracts: [],
    };

    // Find largest single transaction
    const largestTx = transactions.reduce((max, tx) => {
        const value = BigInt(tx.value);
        return value > BigInt(max.value) ? tx : max;
    }, transactions[0] || { value: '0', hash: '', timeStamp: '0' });

    const volume = {
        totalBridgedIn: '0', // Would need bridge-specific detection
        totalBridgedOut: '0',
        largestSingleTx: {
            hash: largestTx?.hash || '',
            value: weiToEth(largestTx?.value || '0'),
            date: largestTx?.timeStamp ? formatDate(largestTx.timeStamp) : '',
        },
        highestValueSwap: zerionData.highestValueSwap,
        totalSwapVolumeUSD: zerionData.totalSwapVolume,
    };

    return {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        totalGasSpentWei: totalGasSpentWei.toString(),
        totalGasSpentEth: weiToEth(totalGasSpentWei.toString()),
        avgGasPerTx,
        totalValueSentWei: totalValueSentWei.toString(),
        totalValueSentEth: weiToEth(totalValueSentWei.toString()),
        totalValueReceivedWei: totalValueReceivedWei.toString(),
        totalValueReceivedEth: weiToEth(totalValueReceivedWei.toString()),
        topDapps,
        uniqueContractsInteracted: Object.keys(contractCounts).length,
        nftsMinted,
        nftsReceived,
        nftsSent,
        uniqueNFTCollections: Object.keys(nftCollectionCounts).length,
        topNFTCollections,
        uniqueTokensTraded: Object.keys(tokenCounts).length,
        topTokens,
        mostActiveMonth,
        mostActiveDay,
        firstTxDate,
        lastTxDate,
        busyDaysCount,
        earlyBirdTxs,
        nightOwlTxs,
        // Enhanced stats
        personality,
        milestones,
        firstTransaction,
        peakDay,
        monthlyBreakdown,
        baseAppJoinDate,
        // NEW: Story-driven stats
        originStory,
        streaks,
        percentile,
        builder,
        volume,
    };
}
