import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook handler for Farcaster mini app events.
 * Receives: miniapp_added, miniapp_removed, notifications_enabled, notifications_disabled
 * 
 * Note: If using Neynar's managed webhook (NEYNAR_CLIENT_ID is set), 
 * this route is not used - Neynar handles token storage automatically.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Decode the payload from base64url
        const payloadBase64 = body.payload;
        const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson);

        console.log('Webhook event received:', payload.event);

        switch (payload.event) {
            case 'miniapp_added':
                // User added the app - store notification token if provided
                if (payload.notificationDetails) {
                    console.log('User enabled notifications:', {
                        url: payload.notificationDetails.url,
                        token: payload.notificationDetails.token?.substring(0, 10) + '...',
                    });
                    // TODO: Store token in database for sending notifications later
                }
                break;

            case 'miniapp_removed':
                // User removed the app - invalidate any stored tokens
                console.log('User removed the app');
                // TODO: Remove stored tokens for this user
                break;

            case 'notifications_enabled':
                // User re-enabled notifications
                if (payload.notificationDetails) {
                    console.log('Notifications re-enabled');
                    // TODO: Update stored token
                }
                break;

            case 'notifications_disabled':
                // User disabled notifications
                console.log('Notifications disabled');
                // TODO: Mark token as inactive
                break;

            default:
                console.log('Unknown event:', payload.event);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { success: false, error: 'Invalid webhook payload' },
            { status: 400 }
        );
    }
}
