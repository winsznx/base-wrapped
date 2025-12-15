/**
 * Base chain transaction API using Routescan.
 * Free tier: 5 calls/sec, 100k calls/day
 * @see https://routescan.io
 * 
 * Routescan provides an Etherscan-compatible API for Base chain.
 */

// Routescan API endpoint for Base (chain ID 8453)
const ROUTESCAN_API = 'https://api.routescan.io/v2/network/mainnet/evm/8453/etherscan/api';

// 2025 year range for wrapped stats
const YEAR_2025_START = Math.floor(new Date('2025-01-01T00:00:00Z').getTime() / 1000);
const YEAR_2025_END = Math.floor(new Date('2025-12-31T23:59:59Z').getTime() / 1000);

export interface Transaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    isError: string;
    contractAddress: string;
    functionName: string;
}

export interface TokenTransfer {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    value: string;
}

export interface NFTTransfer {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    contractAddress: string;
    tokenID: string;
    tokenName: string;
    tokenSymbol: string;
}

async function fetchFromRoutescan<T>(params: Record<string, string>): Promise<T[]> {
    const url = new URL(ROUTESCAN_API);

    // Add all params
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    console.log(`Calling Routescan API: module=${params.module}, action=${params.action}`);

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        console.log(`API Response: status=${data.status}, message=${data.message}, resultCount=${Array.isArray(data.result) ? data.result.length : 'N/A'}`);

        if (data.status === '1' && Array.isArray(data.result)) {
            return data.result as T[];
        }

        // Log any errors
        if (data.status === '0' && data.message !== 'No transactions found') {
            console.warn('API returned error:', data.message, data.result);
        }

        return [];
    } catch (error) {
        console.error('Routescan API error:', error);
        return [];
    }
}

/**
 * Get all normal transactions for an address
 * Falls back to all-time data if no 2025 transactions found
 */
export async function getTransactions(address: string): Promise<Transaction[]> {
    const allTxs = await fetchFromRoutescan<Transaction>({
        module: 'account',
        action: 'txlist',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '10000',
        sort: 'desc',
    });

    console.log(`getTransactions: fetched ${allTxs.length} total transactions`);

    // Filter to 2025 only
    const txs2025 = allTxs.filter(tx => {
        const timestamp = parseInt(tx.timeStamp);
        return timestamp >= YEAR_2025_START && timestamp <= YEAR_2025_END;
    });

    console.log(`getTransactions: ${txs2025.length} transactions in 2025`);

    // If no 2025 data, use all available data
    if (txs2025.length === 0 && allTxs.length > 0) {
        console.log(`No 2025 txs found, using all ${allTxs.length} transactions`);
        return allTxs;
    }

    return txs2025;
}

/**
 * Get internal transactions (contract calls)
 */
export async function getInternalTransactions(address: string): Promise<Transaction[]> {
    const allTxs = await fetchFromRoutescan<Transaction>({
        module: 'account',
        action: 'txlistinternal',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '5000',
        sort: 'desc',
    });

    const txs2025 = allTxs.filter(tx => {
        const timestamp = parseInt(tx.timeStamp);
        return timestamp >= YEAR_2025_START && timestamp <= YEAR_2025_END;
    });

    return txs2025.length === 0 ? allTxs : txs2025;
}

/**
 * Get ERC-20 token transfers
 */
export async function getTokenTransfers(address: string): Promise<TokenTransfer[]> {
    const allTransfers = await fetchFromRoutescan<TokenTransfer>({
        module: 'account',
        action: 'tokentx',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '5000',
        sort: 'desc',
    });

    const transfers2025 = allTransfers.filter(tx => {
        const timestamp = parseInt(tx.timeStamp);
        return timestamp >= YEAR_2025_START && timestamp <= YEAR_2025_END;
    });

    return transfers2025.length === 0 ? allTransfers : transfers2025;
}

/**
 * Get ERC-721 NFT transfers
 */
export async function getNFTTransfers(address: string): Promise<NFTTransfer[]> {
    const allTransfers = await fetchFromRoutescan<NFTTransfer>({
        module: 'account',
        action: 'tokennfttx',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '5000',
        sort: 'desc',
    });

    const transfers2025 = allTransfers.filter(tx => {
        const timestamp = parseInt(tx.timeStamp);
        return timestamp >= YEAR_2025_START && timestamp <= YEAR_2025_END;
    });

    return transfers2025.length === 0 ? allTransfers : transfers2025;
}

/**
 * Get ERC-1155 NFT transfers
 */
export async function getERC1155Transfers(address: string): Promise<NFTTransfer[]> {
    const allTransfers = await fetchFromRoutescan<NFTTransfer>({
        module: 'account',
        action: 'token1155tx',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '5000',
        sort: 'desc',
    });

    const transfers2025 = allTransfers.filter(tx => {
        const timestamp = parseInt(tx.timeStamp);
        return timestamp >= YEAR_2025_START && timestamp <= YEAR_2025_END;
    });

    return transfers2025.length === 0 ? allTransfers : transfers2025;
}

/**
 * Get ETH balance
 */
export async function getBalance(address: string): Promise<string> {
    const url = new URL(ROUTESCAN_API);
    url.searchParams.append('module', 'account');
    url.searchParams.append('action', 'balance');
    url.searchParams.append('address', address);
    url.searchParams.append('tag', 'latest');

    try {
        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status === '1') {
            return data.result;
        }
        return '0';
    } catch {
        return '0';
    }
}

/**
 * Check if address has deployed any contracts (builder detection)
 * Looks for transactions where 'to' is empty/null (contract creation)
 */
export async function getContractCreations(address: string): Promise<{
    count: number;
    contracts: Array<{ address: string; hash: string; timestamp: string }>;
}> {
    const allTxs = await fetchFromRoutescan<Transaction>({
        module: 'account',
        action: 'txlist',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '10000',
        sort: 'desc',
    });

    // Contract creation txs have empty 'to' field and non-empty contractAddress
    const creations = allTxs.filter(tx =>
        tx.from.toLowerCase() === address.toLowerCase() &&
        (!tx.to || tx.to === '') &&
        tx.contractAddress &&
        tx.contractAddress !== ''
    );

    return {
        count: creations.length,
        contracts: creations.map(tx => ({
            address: tx.contractAddress,
            hash: tx.hash,
            timestamp: tx.timeStamp,
        })),
    };
}

/**
 * Get first ever transaction date for the address on Base
 */
export async function getFirstTransactionDate(address: string): Promise<{
    date: string;
    timestamp: number;
    hash: string;
} | null> {
    const txs = await fetchFromRoutescan<Transaction>({
        module: 'account',
        action: 'txlist',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '10000',
        sort: 'asc', // Oldest first
    });

    if (txs.length === 0) return null;

    const firstTx = txs[0];
    const timestamp = parseInt(firstTx.timeStamp);
    const date = new Date(timestamp * 1000);

    return {
        date: date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        timestamp,
        hash: firstTx.hash,
    };
}
