import { NextRequest, NextResponse } from 'next/server';
import { calculateWrappedStats, generateMockStats } from '@/lib/stats';
import { getBuilderData } from '@/lib/talentprotocol';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const demo = searchParams.get('demo') === 'true';

    // Return mock data for demo mode
    if (demo) {
        const mockStats = generateMockStats();
        // Add mock builder score and socials for demo
        mockStats.builderScore = 72;
        mockStats.builderScoreBreakdown = {
            github: 25,
            twitter: 15,
            onchain: 18,
            farcaster: 8,
            identity: 4,
            other: 2,
        };
        mockStats.talentProfile = {
            displayName: 'Based Builder',
            bio: 'Building on Base since day one 🔵',
            verified: true,
        };
        mockStats.socials = {
            farcaster: { username: 'basedbuilder', followers: 1234 },
            twitter: { username: 'basedbuilder_', followers: 5678 },
            github: { username: 'basedbuilder' },
        };
        return NextResponse.json({
            success: true,
            isDemo: true,
            stats: mockStats,
        });
    }

    if (!address) {
        return NextResponse.json(
            { success: false, error: 'Address is required' },
            { status: 400 }
        );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return NextResponse.json(
            { success: false, error: 'Invalid address format' },
            { status: 400 }
        );
    }

    try {
        console.log(`Fetching wrapped stats for address: ${address}`);

        // Fetch onchain stats and Talent Protocol data in parallel
        const [stats, builderData] = await Promise.all([
            calculateWrappedStats(address),
            getBuilderData(address),
        ]);

        // Merge builder data into stats
        stats.builderScore = builderData.score;
        stats.builderScoreBreakdown = builderData.breakdown;
        stats.socials = builderData.socials;

        if (builderData.profile) {
            stats.talentProfile = {
                displayName: builderData.profile.display_name,
                bio: builderData.profile.bio,
                imageUrl: builderData.profile.image_url,
                verified: builderData.profile.verified || builderData.profile.human_checkmark,
            };
        }

        // Check if we got any data
        if (stats.totalTransactions === 0) {
            return NextResponse.json({
                success: true,
                isDemo: false,
                address,
                stats,
                message: 'No transactions found for this address on Base',
            });
        }

        return NextResponse.json({
            success: true,
            isDemo: false,
            address,
            stats,
        });
    } catch (error) {
        console.error('Error fetching wrapped stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats. Please try again.' },
            { status: 500 }
        );
    }
}
