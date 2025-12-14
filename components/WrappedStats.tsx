'use client';

import { useState } from 'react';
import { type WrappedStats } from '@/lib/stats';
import styles from './WrappedStats.module.css';

interface WrappedStatsProps {
    stats: WrappedStats;
    isDemo?: boolean;
}

type SlideType = 'intro' | 'transactions' | 'gas' | 'dapps' | 'nfts' | 'tokens' | 'time' | 'builder' | 'projects' | 'accounts' | 'summary';

const SLIDES: SlideType[] = ['intro', 'transactions', 'gas', 'dapps', 'nfts', 'tokens', 'time', 'builder', 'projects', 'accounts', 'summary'];

// SVG Icons
const Icons = {
    gas: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18H4z" />
            <path d="M18 14h1a2 2 0 0 1 2 2v3a2 2 0 0 0 4 0v-5a2 2 0 0 0-2-2h-3" />
            <path d="M4 12h12" />
            <path d="M8 6h4" />
        </svg>
    ),
    check: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    x: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    sunrise: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v8" />
            <path d="m4.93 10.93 1.41 1.41" />
            <path d="M2 18h2" />
            <path d="M20 18h2" />
            <path d="m19.07 10.93-1.41 1.41" />
            <path d="M22 22H2" />
            <path d="m8 6 4-4 4 4" />
            <path d="M16 18a4 4 0 0 0-8 0" />
        </svg>
    ),
    moon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    ),
    flame: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
    ),
    share: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    ),
    github: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    ),
    twitter: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    onchain: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    farcaster: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm3 3h8v2H8V8zm0 4h8v2H8v-2z" />
        </svg>
    ),
    star: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
};

export function WrappedStats({ stats, isDemo }: WrappedStatsProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(curr => curr + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(curr => curr - 1);
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Build share text with stats
        const shareText = `My 2025 on Base:

${stats.totalTransactions} transactions
${stats.totalGasSpentEth} ETH in gas
${stats.nftsMinted} NFTs minted
${stats.uniqueContractsInteracted} dApps used
${stats.builderScore ? `Builder Score: ${stats.builderScore}` : ''}

Get your Base Wrapped`;

        const appUrl = 'https://base-wrapped-nine.vercel.app';
        const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(appUrl)}`;

        window.open(warpcastUrl, '_blank');
    };

    const slideType = SLIDES[currentSlide];

    return (
        <div className={styles.container}>
            {isDemo && (
                <div className={styles.demoBanner}>
                    Demo Mode - Connect wallet to see your real stats
                </div>
            )}

            <div className={styles.slideContainer} onClick={nextSlide}>
                {slideType === 'intro' && (
                    <div className={`${styles.slide} ${styles.introSlide}`}>
                        {/* Show personalized greeting if we have a name */}
                        {(stats.socials?.farcaster?.username || stats.talentProfile?.displayName) && (
                            <p className={styles.welcomeText}>
                                Hey, {stats.socials?.farcaster?.username
                                    ? `@${stats.socials.farcaster.username}`
                                    : stats.talentProfile?.displayName}! 👋
                            </p>
                        )}
                        <h1 className={styles.heroTitle}>Your 2025</h1>
                        <h2 className={styles.heroSubtitle}>on Base</h2>
                        <p className={styles.tapHint}>Tap to continue</p>
                    </div>
                )}

                {slideType === 'transactions' && (
                    <div className={`${styles.slide} ${styles.txSlide}`}>
                        <p className={styles.slideLabel}>This year you made</p>
                        <div className={styles.bigNumber}>{stats.totalTransactions.toLocaleString()}</div>
                        <p className={styles.slideSubtitle}>transactions on Base</p>
                        <div className={styles.subStats}>
                            <span className={styles.successStat}>
                                <span className={styles.icon}>{Icons.check}</span>
                                {stats.successfulTransactions} successful
                            </span>
                            {stats.failedTransactions > 0 && (
                                <span className={styles.failStat}>
                                    <span className={styles.icon}>{Icons.x}</span>
                                    {stats.failedTransactions} failed
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {slideType === 'gas' && (
                    <div className={`${styles.slide} ${styles.gasSlide}`}>
                        <p className={styles.slideLabel}>You spent</p>
                        <div className={styles.bigNumber}>{stats.totalGasSpentEth}</div>
                        <p className={styles.slideSubtitle}>
                            <span className={styles.icon}>{Icons.gas}</span>
                            ETH on gas
                        </p>
                        <p className={styles.funFact}>
                            That&apos;s about ${(parseFloat(stats.totalGasSpentEth) * 3500).toFixed(2)} USD
                        </p>
                    </div>
                )}

                {slideType === 'dapps' && (
                    <div className={`${styles.slide} ${styles.dappsSlide}`}>
                        <p className={styles.slideLabel}>Your top dApps</p>
                        <div className={styles.dappsList}>
                            {stats.topDapps.slice(0, 3).map((dapp, i) => (
                                <div key={dapp.address} className={styles.dappItem}>
                                    <span className={styles.dappRank}>#{i + 1}</span>
                                    <span className={styles.dappName}>{dapp.name}</span>
                                    <span className={styles.dappCount}>{dapp.count} txs</span>
                                </div>
                            ))}
                        </div>
                        <p className={styles.funFact}>
                            You interacted with {stats.uniqueContractsInteracted} unique contracts
                        </p>
                    </div>
                )}

                {slideType === 'nfts' && (
                    <div className={`${styles.slide} ${styles.nftsSlide}`}>
                        <p className={styles.slideLabel}>NFT Activity</p>
                        <div className={styles.nftStats}>
                            <div className={styles.nftStat}>
                                <span className={styles.nftNumber}>{stats.nftsMinted}</span>
                                <span className={styles.nftLabel}>minted</span>
                            </div>
                            <div className={styles.nftStat}>
                                <span className={styles.nftNumber}>{stats.nftsReceived}</span>
                                <span className={styles.nftLabel}>received</span>
                            </div>
                            <div className={styles.nftStat}>
                                <span className={styles.nftNumber}>{stats.nftsSent}</span>
                                <span className={styles.nftLabel}>sent</span>
                            </div>
                        </div>
                        <p className={styles.funFact}>
                            From {stats.uniqueNFTCollections} collections
                        </p>
                    </div>
                )}

                {slideType === 'tokens' && (
                    <div className={`${styles.slide} ${styles.tokensSlide}`}>
                        <p className={styles.slideLabel}>Token swaps</p>
                        <div className={styles.tokensList}>
                            {stats.topTokens.slice(0, 3).map((token, i) => (
                                <div key={token.symbol} className={styles.tokenItem}>
                                    <span className={styles.tokenRank}>#{i + 1}</span>
                                    <span className={styles.tokenName}>{token.symbol}</span>
                                    <span className={styles.tokenCount}>{token.count} transfers</span>
                                </div>
                            ))}
                        </div>
                        <p className={styles.slideSubtitle}>
                            {stats.uniqueTokensTraded} unique tokens traded
                        </p>
                    </div>
                )}

                {slideType === 'time' && (
                    <div className={`${styles.slide} ${styles.timeSlide}`}>
                        <p className={styles.slideLabel}>When you were most active</p>
                        <div className={styles.timeStats}>
                            <div className={styles.timeStat}>
                                <span className={styles.timeValue}>{stats.mostActiveDay}</span>
                                <span className={styles.timeLabel}>Favorite Day</span>
                            </div>
                            <div className={styles.timeStat}>
                                <span className={styles.timeValue}>{stats.mostActiveMonth}</span>
                                <span className={styles.timeLabel}>Busiest Month</span>
                            </div>
                        </div>
                        <div className={styles.funFacts}>
                            {stats.earlyBirdTxs > 0 && (
                                <p><span className={styles.icon}>{Icons.sunrise}</span> {stats.earlyBirdTxs} early bird txs (before 6am)</p>
                            )}
                            {stats.nightOwlTxs > 0 && (
                                <p><span className={styles.icon}>{Icons.moon}</span> {stats.nightOwlTxs} night owl txs (after 10pm)</p>
                            )}
                            {stats.busyDaysCount > 0 && (
                                <p><span className={styles.icon}>{Icons.flame}</span> {stats.busyDaysCount} power user days (5+ txs)</p>
                            )}
                        </div>
                    </div>
                )}

                {slideType === 'builder' && (
                    <div className={`${styles.slide} ${styles.builderSlide}`}>
                        <p className={styles.slideLabel}>Your Builder Score</p>
                        {stats.builderScore !== null && stats.builderScore !== undefined ? (
                            <>
                                <div className={styles.scoreCircle}>
                                    <svg className={styles.scoreRing} viewBox="0 0 100 100">
                                        <circle className={styles.scoreRingBg} cx="50" cy="50" r="45" />
                                        <circle
                                            className={styles.scoreRingProgress}
                                            cx="50" cy="50" r="45"
                                            style={{
                                                strokeDasharray: `${(stats.builderScore / 100) * 283} 283`
                                            }}
                                        />
                                    </svg>
                                    <span className={styles.scoreValue}>{stats.builderScore}</span>
                                </div>
                                <p className={styles.slideSubtitle}>out of 100</p>
                                {stats.builderScoreBreakdown && (
                                    <div className={styles.scoreBreakdown}>
                                        {stats.builderScoreBreakdown.github > 0 && (
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.icon}>{Icons.github}</span>
                                                <span>{stats.builderScoreBreakdown.github} pts</span>
                                            </div>
                                        )}
                                        {stats.builderScoreBreakdown.twitter > 0 && (
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.icon}>{Icons.twitter}</span>
                                                <span>{stats.builderScoreBreakdown.twitter} pts</span>
                                            </div>
                                        )}
                                        {stats.builderScoreBreakdown.onchain > 0 && (
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.icon}>{Icons.onchain}</span>
                                                <span>{stats.builderScoreBreakdown.onchain} pts</span>
                                            </div>
                                        )}
                                        {stats.builderScoreBreakdown.farcaster > 0 && (
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.icon}>{Icons.farcaster}</span>
                                                <span>{stats.builderScoreBreakdown.farcaster} pts</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className={styles.funFact}>
                                    <span className={styles.icon}>{Icons.star}</span>
                                    Powered by Talent Protocol
                                </p>
                            </>
                        ) : (
                            <>
                                <div className={styles.noScore}>
                                    <p>No Builder Score found</p>
                                    <p className={styles.funFact}>Claim your score at talent.protocol</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {slideType === 'projects' && (
                    <div className={`${styles.slide} ${styles.projectsSlide}`}>
                        <p className={styles.slideLabel}>Your Projects</p>
                        {stats.projects && stats.projects.length > 0 ? (
                            <>
                                <h3 className={styles.slideTitle}>Builder Portfolio</h3>
                                <div className={styles.projectsList}>
                                    {stats.projects.slice(0, 4).map((project, i) => (
                                        <div key={i} className={styles.projectCard}>
                                            <div className={styles.projectName}>{project.name}</div>
                                            <div className={styles.projectRole}>{project.role}</div>
                                            {project.description && (
                                                <div className={styles.projectDesc}>{project.description.slice(0, 80)}...</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className={styles.funFact}>
                                    <span className={styles.icon}>{Icons.star}</span>
                                    {stats.projects.length} project{stats.projects.length > 1 ? 's' : ''} on Talent Protocol
                                </p>
                            </>
                        ) : (
                            <div className={styles.noScore}>
                                <p>No projects found</p>
                                <p className={styles.funFact}>Add projects at talent.protocol</p>
                            </div>
                        )}
                    </div>
                )}

                {slideType === 'accounts' && (
                    <div className={`${styles.slide} ${styles.accountsSlide}`}>
                        <p className={styles.slideLabel}>Your Connections</p>
                        <h3 className={styles.slideTitle}>Connected Accounts</h3>
                        {stats.accounts && stats.accounts.length > 0 ? (
                            <div className={styles.accountsList}>
                                {stats.accounts.map((acc, i) => (
                                    <div key={i} className={styles.accountBadge}>
                                        <span className={styles.icon}>
                                            {acc.verified ? Icons.check : Icons.x}
                                        </span>
                                        <span>{acc.source}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noScore}>
                                <p>No connected accounts</p>
                            </div>
                        )}
                        {stats.topCredentials && stats.topCredentials.length > 0 && (
                            <div className={styles.credentialsSection}>
                                <p className={styles.accountsLabel}>Top Credentials</p>
                                <div className={styles.credentialsList}>
                                    {stats.topCredentials.slice(0, 4).map((cred, i) => (
                                        <div key={i} className={styles.credentialItem}>
                                            <span className={styles.icon}>{Icons.star}</span>
                                            <span>{cred.name}</span>
                                            <span className={styles.credPoints}>{cred.points} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {slideType === 'summary' && (
                    <div className={`${styles.slide} ${styles.summarySlide}`}>
                        <h2 className={styles.summaryTitle}>2025 Wrapped</h2>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{stats.totalTransactions}</span>
                                <span className={styles.summaryLabel}>Transactions</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{stats.totalGasSpentEth}</span>
                                <span className={styles.summaryLabel}>ETH Gas</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{stats.nftsMinted}</span>
                                <span className={styles.summaryLabel}>NFTs Minted</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{stats.uniqueContractsInteracted}</span>
                                <span className={styles.summaryLabel}>dApps Used</span>
                            </div>
                        </div>
                        <p className={styles.summaryTagline}>Based and onchain</p>
                        <button className={styles.shareButton} onClick={handleShare}>
                            <span className={styles.icon}>{Icons.share}</span>
                            Share Your Wrapped
                        </button>
                    </div>
                )}
            </div>

            {/* Progress dots */}
            <div className={styles.progress}>
                {SLIDES.map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.dot} ${i === currentSlide ? styles.activeDot : ''}`}
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                    />
                ))}
            </div>

            {/* Navigation */}
            <div className={styles.navigation}>
                <button
                    className={styles.navButton}
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    disabled={currentSlide === 0}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <span className={styles.slideCounter}>{currentSlide + 1}/{SLIDES.length}</span>
                <button
                    className={styles.navButton}
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    disabled={currentSlide === SLIDES.length - 1}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
