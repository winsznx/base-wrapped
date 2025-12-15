import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Get params
        const username = searchParams.get('nm') || 'Base User';
        const personality = searchParams.get('p') || 'Explorer';
        const txCount = searchParams.get('tx') || '0';
        const percentile = searchParams.get('pct') || '50';
        const color = searchParams.get('color') || '#0052FF';
        const isBuilder = searchParams.get('builder') === 'true';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a0b0d',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                    }}
                >
                    {/* Background Gradient */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(180deg, #0a0b0d 0%, ${color}40 100%)`,
                            zIndex: 0,
                        }}
                    />

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '20px' }}>
                        <div
                            style={{
                                fontSize: 40,
                                fontWeight: 600,
                                color: 'white',
                                marginBottom: 10,
                            }}
                        >
                            {username}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 24,
                                color: '#888',
                                marginBottom: 20,
                                textTransform: 'uppercase',
                                letterSpacing: '4px',
                            }}
                        >
                            Base Wrapped 2025
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                borderRadius: 100,
                                overflow: 'hidden',
                                border: `4px solid ${color}`,
                                marginBottom: 20,
                                padding: 20,
                                background: 'rgba(0,0,0,0.5)',
                            }}
                        >
                            <div style={{ fontSize: 80 }}>
                                {isBuilder ? '🔨' : '🔵'}
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: 80,
                                fontWeight: 900,
                                color: 'white',
                                textAlign: 'center',
                                lineHeight: 1,
                                textShadow: `0 0 40px ${color}80`,
                            }}
                        >
                            {personality.toUpperCase()}
                        </div>

                        <div style={{ display: 'flex', marginTop: 40, gap: '60px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: 48, fontWeight: 700, color: '#fff' }}>{txCount}</div>
                                <div style={{ fontSize: 24, color: '#888' }}>Transactions</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: 48, fontWeight: 700, color: '#fff' }}>Top {percentile}%</div>
                                <div style={{ fontSize: 24, color: '#888' }}>Rank</div>
                            </div>
                            {isBuilder && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: 48, fontWeight: 700, color: '#fff' }}>Verified</div>
                                    <div style={{ fontSize: 24, color: '#888' }}>Builder</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logo Bottom */}
                    <div style={{ position: 'absolute', bottom: 40, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: '#0052FF' }} />
                        <div style={{ fontSize: 24, fontWeight: 600 }}>Base</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e) {
        console.error(e);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
