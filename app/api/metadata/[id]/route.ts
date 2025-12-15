import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { calculateWrappedStats } from '@/lib/stats';
import { getBuilderData } from '@/lib/talentprotocol';
import { getFarcasterData } from '@/lib/neynar';

import { BASE_WRAPPED_CONTRACT } from '@/lib/contract';

const CONTRACT_ADDRESS = BASE_WRAPPED_CONTRACT.address;

// ABI for ownerOf
const ABI = [
    {
        name: 'ownerOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: 'owner', type: 'address' }],
    },
] as const;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Token ID required' }, { status: 400 });
    }

    try {
        if (!CONTRACT_ADDRESS) {
            console.warn('Contract address not set');
            // Fallback for testing? Or API error.
            // return NextResponse.json({ error: 'Contract not configured' }, { status: 500 });
        }

        const client = createPublicClient({
            chain: base,
            transport: http(),
        });

        // 1. Get Owner of Token ID
        // If contract not deployed/set, this will fail. We should handle graceful failure or mock for dev.
        let owner: string;
        try {
            if (CONTRACT_ADDRESS) {
                owner = await client.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: ABI,
                    functionName: 'ownerOf',
                    args: [BigInt(id)],
                });
            } else {
                throw new Error("Contract address missing");
            }
        } catch (e) {
            console.error(`Error fetching owner for token ${id}:`, e);
            return NextResponse.json({ error: 'Token does not exist' }, { status: 404 });
        }

        // 2. Fetch Stats for Owner
        const [stats, builderData, farcasterData] = await Promise.all([
            calculateWrappedStats(owner),
            getBuilderData(owner),
            getFarcasterData(owner),
        ]);

        // Merge logic (simplified from api/wrapped/route.ts)
        stats.socials = builderData.socials;
        if (farcasterData) {
            stats.farcaster = {
                ...farcasterData.profile, // simplified spread
                // We only need basic data for the image usually
                username: farcasterData.profile.username,
                followerCount: farcasterData.profile.followerCount,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
        }

        // 3. Construct Metadata
        const name = stats.socials?.farcaster?.username || stats.talentProfile?.displayName || 'Base User';
        const rank = stats.percentile ? (100 - stats.percentile.overall).toFixed(1) : '?';
        const txCount = stats.totalTransactions.toString();
        const personality = stats.personality?.title || 'Explorer';

        // Construct Image URL (reuse OG generator)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://base-wrapped-nine.vercel.app';
        const params = new URLSearchParams();
        params.set('nm', name);
        params.set('tx', txCount);
        params.set('pct', rank);
        if (stats.personality) {
            params.set('p', stats.personality.title);
            params.set('color', stats.personality.color);
        }
        if (stats.builder?.isBuilder) {
            params.set('builder', 'true');
        }

        const imageUrl = `${appUrl}/api/og?${params.toString()}`;

        return NextResponse.json({
            name: `${name}'s 2025 on Base`,
            description: `Base Wrapped 2025 Stats: ${txCount} Txs, Top ${rank}%, ${personality} Archetype.`,
            image: imageUrl,
            attributes: [
                { trait_type: "Archetype", value: personality },
                { trait_type: "Transactions", value: stats.totalTransactions },
                { trait_type: "Rank %", value: stats.percentile ? (100 - stats.percentile.overall) : 0 },
                { trait_type: "Builder Score", value: stats.builderScore || 0 },
                { trait_type: "Year", value: "2025" }
            ]
        });

    } catch (error) {
        console.error('Metadata generation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
