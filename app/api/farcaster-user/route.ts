import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
        return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Neynar API key not configured' }, { status: 500 });
    }

    try {
        // Fetch user data from Neynar using FID
        const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Neynar API error:', response.status, response.statusText);
            return NextResponse.json({ error: 'Failed to fetch user data' }, { status: response.status });
        }

        const data = await response.json();
        const users = data.users;

        if (!users || users.length === 0) {
            return NextResponse.json({ error: 'No user found for this FID' }, { status: 404 });
        }

        const user = users[0];

        return NextResponse.json({
            success: true,
            fid: user.fid,
            username: user.username,
            verifiedAddresses: {
                ethAddresses: user.verified_addresses?.eth_addresses || [],
                solAddresses: user.verified_addresses?.sol_addresses || [],
            },
            primaryAddress: user.verified_addresses?.eth_addresses?.[0] || null,
        });

    } catch (error) {
        console.error('Error fetching Farcaster user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
