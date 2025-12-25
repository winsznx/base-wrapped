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
                'authorization': `Basic ${Buffer.from(ZERION_API_KEY + ':').toString('base64')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Zerion API error: ${response.statusText}`);
        }

        const data: ZerionResponse = await response.json();
        const transactions = data.data || [];

        console.log('[Zerion] Fetched transactions:', transactions.length);
        const processed = processZerionStats(transactions, address);
        console.log('[Zerion] Processed data:', processed);

        return processed;

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
    const KNOWN_DAPPS: Record<string, string> = {
        '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': 'Uniswap',
        '0x2626664c2603336e57b271c5c0b26f421741e481': 'Uniswap V3',
        '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap Universal Router',
        '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': 'Aerodrome',
        '0x940181a94a35a4569e4529a3cdf79ca2d8f85cb9': 'Aerodrome Router',
        '0x420dd381b31aef6683db6b902084cb0ffece40da': 'Aerodrome Voter',
        '0x327df1e6de05895d2ab08513aadd9313fe505d86': 'BaseSwap',
        '0x1111111254fb6c44bac0bed2854e76f90643097d': '1inch',
        '0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc': 'Odos',
    };

    const topDapps = Array.from(dappsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(d => {
            let finalName = d.name;

            // If name looks like an address (starts with 0x), try to find it in KNOWN_DAPPS
            if (finalName.startsWith('0x')) {
                const lowerName = finalName.toLowerCase();
                finalName = KNOWN_DAPPS[lowerName] || finalName;
            }

            return {
                name: finalName,
                imageUrl: d.icon,
                count: d.count,
                address: ''
            };
        });

    console.log('[Zerion] Top dApps:', topDapps);

    return {
        topDapps: topDapps.length > 0 ? topDapps : undefined,
        highestValueSwap: highestValueSwap.amountUSD > 0 ? highestValueSwap : undefined,
        totalSwapVolume: totalVolumeUSD > 0 ? totalVolumeUSD : undefined,
    };
}
