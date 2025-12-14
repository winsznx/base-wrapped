import { NextRequest, NextResponse } from 'next/server';
import { calculateWrappedStats } from '@/lib/stats';
import { getBuilderData } from '@/lib/talentprotocol';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

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

        // Add profile data
        if (builderData.profile) {
            stats.talentProfile = {
                displayName: builderData.profile.display_name,
                bio: builderData.profile.bio,
                imageUrl: builderData.profile.image_url,
                verified: builderData.profile.verified,
                humanCheckmark: builderData.profile.human_checkmark,
            };
        }

        // Add accounts data
        if (builderData.accounts && builderData.accounts.length > 0) {
            stats.accounts = builderData.accounts.map(acc => ({
                source: acc.source,
                verified: acc.verified,
            }));
        }

        // Add projects data
        if (builderData.projects && builderData.projects.length > 0) {
            stats.projects = builderData.projects.map(proj => ({
                name: proj.name,
                description: proj.description,
                url: proj.url,
                logoUrl: proj.logo_url,
                role: proj.role,
            }));
        }

        // Add top credentials
        if (builderData.topCredentials && builderData.topCredentials.length > 0) {
            stats.topCredentials = builderData.topCredentials.map(cred => ({
                name: cred.name,
                category: cred.category,
                points: cred.points,
            }));
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
