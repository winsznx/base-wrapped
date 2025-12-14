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
} from './basescan';

// Known dApp contract addresses on Base
const KNOWN_DAPPS: Record<string, string> = {
    '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': 'Uniswap',
    '0x2626664c2603336e57b271c5c0b26f421741e481': 'Uniswap V3',
    '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': 'Aerodrome',
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
    '0x4200000000000000000000000000000000000006': 'WETH',
    '0x3e7ef8f50246f725885102e8238cbba33f276747': 'Aave',
    '0x78a087d713be963bf307b18f2ff8122ef9a63ae9': 'Beefy',
    '0x940181a94a35a4569e4529a3cdf79ca2d8f85cb9': 'Aerodrome',
    '0xec8e5342b19977b4ef8892e02d8dbafc80bd1f0': 'friend.tech',
    '0x9a26f5433671751c3276a065f57e5a02d2817973': 'Basecamp',
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap Universal Router',
    '0x1111111254fb6c44bac0bed2854e76f90643097d': '1inch',
};

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
    topDapps: Array<{ name: string; address: string; count: number }>;
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

export async function calculateWrappedStats(address: string): Promise<WrappedStats> {
    const normalizedAddress = address.toLowerCase();

    // Fetch all data in parallel
    const [transactions, _internalTxs, tokenTransfers, nftTransfers, erc1155Transfers] = await Promise.all([
        getTransactions(address),
        getInternalTransactions(address),
        getTokenTransfers(address),
        getNFTTransfers(address),
        getERC1155Transfers(address),
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

    const topDapps = Object.entries(contractCounts)
        .map(([address, count]) => ({
            address,
            name: KNOWN_DAPPS[address] || `${address.slice(0, 6)}...${address.slice(-4)}`,
            count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

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
    };
}

// Generate mock stats for demo/testing when no API key
export function generateMockStats(): WrappedStats {
    return {
        totalTransactions: 247,
        successfulTransactions: 239,
        failedTransactions: 8,
        totalGasSpentWei: '54230000000000000',
        totalGasSpentEth: '0.054230',
        avgGasPerTx: '219635627530364',
        totalValueSentWei: '1250000000000000000',
        totalValueSentEth: '1.250000',
        totalValueReceivedWei: '890000000000000000',
        totalValueReceivedEth: '0.890000',
        topDapps: [
            { name: 'Uniswap', address: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', count: 89 },
            { name: 'Aerodrome', address: '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43', count: 45 },
            { name: 'Aave', address: '0x3e7ef8f50246f725885102e8238cbba33f276747', count: 23 },
            { name: 'Zora', address: '0x7777777f279eba3d3ad8f4e708545291a6fdba8b', count: 18 },
            { name: 'friend.tech', address: '0xec8e5342b19977b4ef8892e02d8dbafc80bd1f0', count: 12 },
        ],
        uniqueContractsInteracted: 34,
        nftsMinted: 15,
        nftsReceived: 7,
        nftsSent: 3,
        uniqueNFTCollections: 8,
        topNFTCollections: [
            { name: 'Based Punks', symbol: 'BPUNK', count: 5 },
            { name: 'Onchain Summer', symbol: 'OCS', count: 4 },
            { name: 'Base, Pair, Share', symbol: 'BPS', count: 3 },
        ],
        uniqueTokensTraded: 12,
        topTokens: [
            { name: 'USD Coin', symbol: 'USDC', count: 67 },
            { name: 'Wrapped Ether', symbol: 'WETH', count: 45 },
            { name: 'Aerodrome', symbol: 'AERO', count: 23 },
        ],
        mostActiveMonth: 'October',
        mostActiveDay: 'Friday',
        firstTxDate: 'Jan 3, 2025',
        lastTxDate: 'Dec 12, 2025',
        busyDaysCount: 14,
        earlyBirdTxs: 12,
        nightOwlTxs: 34,
    };
}
