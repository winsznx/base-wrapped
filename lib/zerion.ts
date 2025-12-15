const ZERION_API_KEY = process.env.ZERION_API_KEY;
const BASE_CHAIN_ID = 'base'; // Zerion uses 'base' for Base chain

interface ZerionTransaction {
    id: string;
    attributes: {
        operation_type: string;
        hash: string;
        mined_at_block: number;
        mined_at: string; // ISO date
        sent_from: string;
        sent_to: string;
        status: string;
        nonce: number;
        fee: {
            fungible_info: {
                name: string;
                symbol: string;
                icon: { url: string };
            };
            quantity: {
                float: number;
            };
        };
        transfers: ZerionTransfer[];
        application_metadata?: {
            name: string;
            icon: { url: string };
        };
    };
}

interface ZerionTransfer {
    fungible_info?: {
        name: string;
        symbol: string;
        icon?: { url: string };
    };
    direction: 'in' | 'out';
    quantity: {
        float: number;
    };
    value?: number; // USD value if available
}

interface ZerionResponse {
    data: ZerionTransaction[];
    links?: {
        next?: string;
    };
}

export async function fetchZerionData(address: string): Promise<{
    topDapps?: Array<{ name: string; address: string; count: number; imageUrl?: string }>;
    highestValueSwap?: { amountUSD: number; tokenSymbol: string; date: string };
    totalSwapVolume?: number;
}> {
    if (!ZERION_API_KEY) {
        console.warn("ZERION_API_KEY is missing. Skipping rich data fetch.");
        return {};
    }

    try {
        const url = `https://api.zerion.io/v1/wallets/${address}/transactions/?currency=usd&filter[chain_ids]=${BASE_CHAIN_ID}&page[size]=100`;
        const response = await fetch(url, {
            headers: {
                'accept': 'application/json',
                'authorization': `Basic ${ZERION_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Zerion API error: ${response.statusText}`);
        }

        const data: ZerionResponse = await response.json();
        const transactions = data.data || [];

        return processZerionStats(transactions, address);

    } catch (error) {
        console.error("Failed to fetch Zerion data:", error);
        return {};
    }
}

function processZerionStats(transactions: ZerionTransaction[], _userAddress: string): {
    topDapps?: Array<{ name: string; address: string; count: number; imageUrl?: string }>;
    highestValueSwap?: { amountUSD: number; tokenSymbol: string; date: string };
    totalSwapVolume?: number;
} {
    const dappsMap = new Map<string, { name: string, icon?: string, count: number }>();
    let highestValueSwap = {
        amountUSD: 0,
        tokenSymbol: '',
        date: ''
    };
    let totalVolumeUSD = 0;

    for (const tx of transactions) {
        const attr = tx.attributes;

        // 1. Top Dapps
        if (attr.application_metadata) {
            const appName = attr.application_metadata.name;
            const appIcon = attr.application_metadata.icon?.url;

            // Skip "Wallet" type apps if they are just transfers
            if (appName && appName !== 'Unknown Application') {
                const current = dappsMap.get(appName) || { name: appName, icon: appIcon, count: 0 };
                current.count++;
                dappsMap.set(appName, current);
            }
        }

        // 2. Highest Swap & Volume
        if (attr.operation_type === 'trade') {
            // Calculate value of outgoing transfers (what was sold) or incoming (what was bought)
            // Ideally we sum up USD value of 'out' transfers to define 'spend' or 'swap size'
            let swapValue = 0;
            let swapToken = '';

            for (const transfer of attr.transfers) {
                if (transfer.value) {
                    swapValue += transfer.value; // Total value of transfers in this tx
                    totalVolumeUSD += transfer.value;

                    if (transfer.fungible_info) {
                        swapToken = transfer.fungible_info.symbol;
                    }
                }
            }

            if (swapValue > highestValueSwap.amountUSD) {
                highestValueSwap = {
                    amountUSD: swapValue,
                    tokenSymbol: swapToken,
                    date: attr.mined_at
                };
            }
        }
    }

    // Sort Dapps by count
    const topDapps = Array.from(dappsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(d => ({
            name: d.name,
            imageUrl: d.icon,
            count: d.count,
            address: '' // Zerion might not provide a single contract address for an app
        }));

    return {
        topDapps: topDapps.length > 0 ? topDapps : undefined,
        highestValueSwap: highestValueSwap.amountUSD > 0 ? highestValueSwap : undefined,
        totalSwapVolume: totalVolumeUSD > 0 ? totalVolumeUSD : undefined,
    };
}
