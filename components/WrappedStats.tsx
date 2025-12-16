
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { type WrappedStats } from '@/lib/stats';
import styles from './WrappedStats.module.css';
import { CountUp } from './ui/CountUp';
import { Confetti } from './ui/Confetti';
import { ProgressRing } from './ui/ProgressRing';
import {
    Hammer, TrendingUp, Image as ImageIcon, MoveHorizontal, Zap, Laugh, Sunrise,
    Anchor, MessageSquare, Gem, Compass, Trophy, Crown, Award, Paintbrush,
    Fuel, Check, X, Share2, Github, Twitter, Link as LinkIcon, Diamond
} from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { BaseWrappedABI } from '@/lib/abi/BaseWrapped';
import { BASE_WRAPPED_CONTRACT } from '@/lib/contract';

interface WrappedStatsProps {
    stats: WrappedStats;
}

type SlideType = 'intro' | 'origin' | 'baseAppJoined' | 'firstTx' | 'transactions' | 'moneyMoves' | 'percentile' | 'streaks' | 'gas' | 'peakDay' | 'dapps' | 'nfts' | 'tokens' | 'time' | 'personality' | 'builderReveal' | 'milestones' | 'builder' | 'projects' | 'accounts' | 'farcaster' | 'summary';

const ALL_SLIDES: SlideType[] = [
    'intro',
    'origin',          // NEW: "You've been on Base since..."
    'baseAppJoined',
    'firstTx',
    'transactions',
    'moneyMoves',      // NEW: Highest swap & volume
    'percentile',      // NEW: "Top X% of Base users"
    'streaks',         // NEW: Longest streak, active days
    'gas',
    'peakDay',
    'dapps',
    'nfts',
    'tokens',
    'time',
    'personality',
    'builderReveal',   // NEW: "YOU SHIPPED" - contract deployment reveal
    'milestones',
    'builder',
    'projects',
    'accounts',
    'farcaster',
    'summary'
];

// Helper to render Lucide icons by name
const IconMap: Record<string, React.ElementType> = {
    Hammer, TrendingUp, Image: ImageIcon, MoveHorizontal, Zap, Laugh, Sunrise,
    Anchor, MessageSquare, Gem, Compass, Trophy, Crown, Award, Paintbrush,
    Fuel, Check, X, Share2, Github, Twitter, Link: LinkIcon, Diamond
};

// Helper to format account source names
const formatAccountSource = (source: string): string => {
    const sourceMap: Record<string, string> = {
        'wallet': 'Wallet',
        'farcaster': 'Farcaster',
        'twitter': 'Twitter',
        'x_twitter': 'X (Twitter)',
        'github': 'GitHub',
        'linkedin': 'LinkedIn',
        'lens': 'Lens Protocol',
        'talent_protocol': 'Talent Protocol',
        'ens': 'ENS',
        'email': 'Email',
        'discord': 'Discord',
        'telegram': 'Telegram'
    };
    return sourceMap[source.toLowerCase()] || source.charAt(0).toUpperCase() + source.slice(1);
};

const LucideIcon = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
    const Icon = IconMap[name] || Zap;
    return <Icon size={size} className={className} />;
};

// SVG Icons (Legacy / Specific UI)
const Icons = {
    gas: <Fuel size={24} />,
    check: <Check size={16} />,
    x: <X size={16} />,
    sunrise: <Sunrise size={18} />,
    moon: <span style={{ fontSize: 18 }}>🌙</span>, // Lucide Moon is filled usually
    flame: <span style={{ fontSize: 18 }}>🔥</span>,
    share: <Share2 size={20} />,
    github: <Github size={18} />,
    twitter: <Twitter size={18} />,
    onchain: <LinkIcon size={18} />,
    farcaster: <MessageSquare size={18} />,
    star: <span style={{ fontSize: 18 }}>⭐</span>,
};

// Format numbers Base style: 100K, 1M, 1B
function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 10_000) {
        return (num / 1_000).toFixed(0) + 'K';
    }
    if (num >= 1_000) {
        return num.toLocaleString();
    }
    return num.toString();
}

export function WrappedStats({ stats }: WrappedStatsProps) {
    // Filter slides based on available data - skip slides that would be empty
    const SLIDES = useMemo(() => {
        return ALL_SLIDES.filter((slide) => {
            switch (slide) {
                case 'origin':
                    return !!stats.originStory;
                case 'baseAppJoined':
                    return !!stats.baseAppJoinDate;
                case 'firstTx':
                    return !!stats.firstTransaction;
                case 'moneyMoves':
                    return !!stats.volume && (!!stats.volume.highestValueSwap || parseFloat(stats.volume.largestSingleTx.value) > 0);
                case 'percentile':
                    return !!stats.percentile;
                case 'streaks':
                    return !!stats.streaks && stats.streaks.longestStreak > 1;
                case 'peakDay':
                    return !!stats.peakDay;
                case 'personality':
                    return !!stats.personality;
                case 'builderReveal':
                    return !!stats.builder && stats.builder.isBuilder;
                case 'milestones':
                    return stats.milestones && stats.milestones.some(m => m.achieved);
                case 'projects':
                    return stats.projects && stats.projects.length > 0;
                case 'accounts':
                    return (stats.accounts && stats.accounts.length > 0) || (stats.topCredentials && stats.topCredentials.length > 0);
                case 'farcaster':
                    return !!stats.farcaster;
                default:
                    return true;
            }
        });
    }, [stats]);

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

    const getShareUrl = () => {
        const params = new URLSearchParams();
        const name = stats.socials?.farcaster?.username || stats.talentProfile?.displayName || 'Base User';
        params.set('nm', name);

        if (stats.personality) {
            params.set('p', stats.personality.title);
            params.set('color', stats.personality.color);
        }

        params.set('tx', stats.totalTransactions.toString());

        if (stats.percentile) {
            params.set('pct', (100 - stats.percentile.overall).toFixed(1));
        }

        if (stats.builder && stats.builder.isBuilder) {
            params.set('builder', 'true');
        }

        return `https://base-wrapped-nine.vercel.app/api/og?${params.toString()}`;
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();

        const shareUrl = getShareUrl();

        const emojiMap: Record<string, string> = {
            'Hammer': '🔨', 'TrendingUp': '📈', 'Image': '🖼️', 'MoveHorizontal': '🌉',
            'Zap': '⚡', 'Laugh': '🐸', 'Sunrise': '🌅', 'Anchor': '🐋',
            'MessageSquare': '💬', 'Gem': '💎', 'Compass': '🧭', 'Trophy': '🏆',
            'Crown': '👑', 'Award': '🏅', 'Paintbrush': '🎨', 'Fuel': '⛽', 'Diamond': '💎'
        };
        const pEmoji = stats.personality ? (emojiMap[stats.personality.emoji] || stats.personality.emoji) : '';

        const shareText = `My 2025 on Base:
${stats.personality ? `I'm a ${stats.personality.title} ${pEmoji}` : ''}

${stats.totalTransactions} Transactions
Top ${stats.percentile ? (100 - stats.percentile.overall).toFixed(1) : '?'}% of users
${stats.builder?.isBuilder ? 'Verified Builder 🔨' : ''}

Get your Base Wrapped`;

        // Use Farcaster protocol link to open in Farcaster app
        const farcasterUrl = `farcaster://compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`;

        window.location.href = farcasterUrl;
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = getShareUrl();

        try {
            const response = await fetch(shareUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `base-wrapped-2025-${stats.farcaster?.username || 'user'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download image:', err);
        }
    };

    // Mint Logic
    const { writeContract, data: hash, isPending: isMintPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleMint = (e: React.MouseEvent) => {
        e.stopPropagation();

        writeContract({
            address: BASE_WRAPPED_CONTRACT.address,
            abi: BaseWrappedABI,
            functionName: 'mint',
            value: parseEther(BASE_WRAPPED_CONTRACT.mintPrice),
        });
    };

    const slideType = SLIDES[currentSlide];

    return (
        <div className={styles.container}>
            <div className={styles.slideContainer} onClick={nextSlide}>
                {slideType === 'intro' && (
                    <div className={`${styles.slide} ${styles.introSlide}`}>
                        {/* Show personalized greeting if we have a name */}
                        {(stats.farcaster?.username || stats.talentProfile?.displayName) && (
                            <p className={styles.welcomeText}>
                                Hey, {stats.farcaster?.username
                                    ? `${stats.farcaster.username}`
                                    : stats.talentProfile?.displayName}! 👋
                            </p>
                        )}
                        <h1 className={styles.heroTitle}>Your 2025</h1>
                        <h2 className={styles.heroSubtitle}>on Base</h2>

                        {stats.farcaster && (
                            <div className={styles.introSocials}>
                                {stats.farcaster.pfpUrl && (
                                    <Image
                                        src={stats.farcaster.pfpUrl}
                                        alt="Profile"
                                        width={48}
                                        height={48}
                                        className={styles.introPfp}
                                    />
                                )}
                                <div className={styles.socialBadge}>
                                    <span className={styles.socialIcon}><LucideIcon name="MessageSquare" size={16} /></span>
                                    <span>@{stats.farcaster.username}</span>
                                </div>
                                <div className={styles.socialStats}>
                                    <span>{formatNumber(stats.farcaster.followerCount)} followers</span>
                                </div>
                            </div>
                        )}

                        <p className={styles.tapHint}>Tap to continue</p>
                    </div>
                )}

                {/* NEW: Origin Story Slide */}
                {slideType === 'origin' && stats.originStory && (
                    <div className={`${styles.slide} ${styles.originSlide}`}>
                        {stats.originStory.joinedBefore2024 && <Confetti />}
                        <p className={styles.slideLabel}>Your Origin Story</p>
                        <h2 className={styles.slideTitle}>You&apos;ve been on Base since</h2>
                        <div className={styles.bigDate}>{stats.originStory.firstEverTxDate}</div>
                        <div className={styles.statsRow}>
                            <div className={styles.statBox}>
                                <span className={styles.statNumber}>
                                    <CountUp end={stats.originStory.daysOnBase} duration={2000} />
                                </span>
                                <span className={styles.statLabel}>days on Base</span>
                            </div>
                        </div>
                        {stats.originStory.joinedBefore2024 && (
                            <p className={styles.ogBadge}>
                                🏛️ OG Status — Here before 2024
                            </p>
                        )}
                    </div>
                )}

                {slideType === 'baseAppJoined' && stats.baseAppJoinDate && (
                    <div className={`${styles.slide} ${styles.baseAppJoinedSlide}`}>
                        <p className={styles.slideLabel}>Welcome to Base</p>
                        <div className={styles.baseAppLogo}>
                            <Image src="/base-square.svg" alt="Base" width={80} height={80} />
                        </div>
                        <h2 className={styles.slideTitle}>You Joined Base App</h2>
                        <div className={styles.storyCard}>
                            <p className={styles.storyDate}>{stats.baseAppJoinDate.date}</p>
                            <p className={styles.storyText}>
                                You&apos;re one of the early adopters who got the Beta NFT!
                            </p>
                        </div>
                        {stats.baseAppJoinDate.isEarlyAdopter && (
                            <p className={styles.funFact}>
                                <span className={styles.icon}>{Icons.star}</span>
                                OG Status Unlocked
                            </p>
                        )}
                    </div>
                )}

                {slideType === 'firstTx' && stats.firstTransaction && (
                    <div className={`${styles.slide} ${styles.firstTxSlide}`}>
                        <p className={styles.slideLabel}>Where It All Began</p>
                        <h3 className={styles.slideTitle}>Your First Transaction</h3>
                        <div className={styles.storyCard}>
                            <p className={styles.storyDate}>{stats.firstTransaction.date}</p>
                            <p className={styles.storyText}>
                                You made your first move on Base — a {stats.firstTransaction.type === 'contract_call' ? 'contract interaction' : 'transfer'}
                                {parseFloat(stats.firstTransaction.value) > 0 && ` worth ${stats.firstTransaction.value} ETH`}
                            </p>
                        </div>
                        <p className={styles.funFact}>
                            <span className={styles.icon}>{Icons.star}</span>
                            And the rest is history
                        </p>
                    </div>
                )}

                {slideType === 'transactions' && (
                    <div className={`${styles.slide} ${styles.txSlide}`}>
                        <p className={styles.slideLabel}>This Year You Made</p>
                        <div className={styles.bigNumber}>
                            <CountUp end={stats.totalTransactions} duration={2000} />
                        </div>
                        <p className={styles.slideSubtitle}>Transactions on Base</p>
                        <div className={styles.subStats}>
                            <span className={styles.successStat}>
                                <span className={styles.icon}>{Icons.check}</span>
                                <CountUp end={stats.successfulTransactions} duration={1500} /> successful
                            </span>
                            {stats.failedTransactions > 0 && (
                                <span className={styles.failStat}>
                                    <span className={styles.icon}>{Icons.x}</span>
                                    <CountUp end={stats.failedTransactions} duration={1500} /> failed
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {slideType === 'moneyMoves' && stats.volume && (
                    <div className={`${styles.slide} ${styles.moneyMovesSlide} ${styles.greenTheme}`}>
                        <p className={styles.slideLabel}>Big Money Moves</p>

                        {stats.volume.highestValueSwap ? (
                            <>
                                <h3 className={styles.slideTitle}>Biggest Swap</h3>
                                <div className={styles.bigNumber} style={{ fontSize: '3rem' }}>
                                    ${formatNumber(Math.round(stats.volume.highestValueSwap.amountUSD))}
                                </div>
                                <p className={styles.slideSubtitle}>
                                    IN {stats.volume.highestValueSwap.tokenSymbol}
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className={styles.slideTitle}>Largest Tx</h3>
                                <div className={styles.bigNumber} style={{ fontSize: '3rem' }}>
                                    {parseFloat(stats.volume.largestSingleTx.value).toFixed(2)} ETH
                                </div>
                                <p className={styles.slideSubtitle}>
                                    Valued at ~${formatNumber(Math.round(parseFloat(stats.volume.largestSingleTx.value) * 3500))}
                                </p>
                            </>
                        )}

                        {stats.volume.totalSwapVolumeUSD && (
                            <div className={styles.volumeBox}>
                                <p className={styles.volumeLabel}>Total Volume</p>
                                <div className={styles.volumeValue}>
                                    ${formatNumber(Math.round(stats.volume.totalSwapVolumeUSD))}
                                </div>
                            </div>
                        )}

                        <p className={styles.funFact}>
                            <span className={styles.icon}>💸</span>
                            {stats.volume.highestValueSwap ? 'Whale alert! 🐋' : 'Moving chunks onchain'}
                        </p>
                    </div>
                )}

                {slideType === 'percentile' && stats.percentile && (
                    <div className={`${styles.slide} ${styles.percentileSlide}`}>
                        <p className={styles.slideLabel}>You&apos;re in the</p>
                        <div className={styles.percentileNumber}>
                            Top <CountUp end={100 - stats.percentile.overall} decimals={1} suffix="%" duration={2500} />
                        </div>
                        <p className={styles.slideSubtitle}>of Base Users</p>
                        <div className={styles.percentileBreakdown}>
                            <div className={styles.percentileItem}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ProgressRing radius={20} stroke={3} progress={100 - stats.percentile.transactions} color="#FFD700" />
                                    <span>Transactions</span>
                                </div>
                                <span className={styles.percentileValue}>Top {100 - stats.percentile.transactions}%</span>
                            </div>
                            <div className={styles.percentileItem}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ProgressRing radius={20} stroke={3} progress={100 - stats.percentile.gasSpent} color="#FF6B35" />
                                    <span>Gas Spent</span>
                                </div>
                                <span className={styles.percentileValue}>Top {100 - stats.percentile.gasSpent}%</span>
                            </div>
                            {/* Removed contracts breakdown if not needed, or add specialized logic later */}
                        </div>
                    </div>
                )}

                {/* NEW: Streaks Slide */}
                {slideType === 'streaks' && stats.streaks && (
                    <div className={`${styles.slide} ${styles.streaksSlide}`}>
                        <p className={styles.slideLabel}>Your Activity Streaks</p>
                        <div className={styles.streaksBig}>
                            <span className={styles.streakNumber}>
                                <CountUp end={stats.streaks.longestStreak} duration={2500} />
                            </span>
                            <span className={styles.streakLabel}>day streak</span>
                        </div>
                        <p className={styles.slideSubtitle}>Your longest consecutive run</p>
                        <div className={styles.statsRow}>
                            <div className={styles.statBox}>
                                <span className={styles.statNumber}>
                                    <CountUp end={stats.streaks.activeDays} duration={2000} />
                                </span>
                                <span className={styles.statLabel}>active days total</span>
                            </div>
                            <div className={styles.statBox}>
                                <span className={styles.statNumber}>
                                    <CountUp end={stats.streaks.activeDaysThisYear} duration={2000} />
                                </span>
                                <span className={styles.statLabel}>days in 2025</span>
                            </div>
                        </div>
                        {stats.streaks.currentStreak > 0 && (
                            <p className={styles.currentStreak}>
                                🔥 Current streak: <CountUp end={stats.streaks.currentStreak} duration={1500} /> days
                            </p>
                        )}
                    </div>
                )}

                {slideType === 'gas' && (
                    <div className={`${styles.slide} ${styles.gasSlide}`}>
                        <p className={styles.slideLabel}>You Spent</p>
                        <div className={styles.bigNumber}>{stats.totalGasSpentEth}</div>
                        <p className={styles.slideSubtitle}>
                            <span className={styles.icon}>{Icons.gas}</span>
                            ETH on Gas
                        </p>
                        <p className={styles.funFact}>
                            That&apos;s about ${formatNumber(Math.round(parseFloat(stats.totalGasSpentEth) * 3500))} USD
                        </p>
                    </div>
                )}

                {slideType === 'peakDay' && stats.peakDay && (
                    <div className={`${styles.slide} ${styles.peakDaySlide}`}>
                        <p className={styles.slideLabel}>Your Wildest Day</p>
                        <div className={styles.bigNumber}>{stats.peakDay.txCount}</div>
                        <p className={styles.slideSubtitle}>Transactions in One Day</p>
                        <div className={styles.storyCard}>
                            <p className={styles.storyDate}>{stats.peakDay.date}</p>
                            <p className={styles.storyText}>{stats.peakDay.description}</p>
                        </div>
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

                {slideType === 'personality' && stats.personality && (
                    <div className={`${styles.slide} ${styles.personalitySlide}`} style={{ '--personality-color': stats.personality.color } as React.CSSProperties}>
                        <p className={styles.slideLabel}>Your Onchain Personality</p>
                        <div className={styles.personalityEmoji}>
                            <LucideIcon name={stats.personality.emoji} size={80} />
                        </div>
                        <h2 className={styles.personalityTitle}>{stats.personality.title}</h2>
                        <p className={styles.personalityDesc}>{stats.personality.description}</p>
                    </div>
                )}

                {/* NEW: Builder Reveal Slide - "YOU SHIPPED" */}
                {slideType === 'builderReveal' && stats.builder && stats.builder.isBuilder && (
                    <div className={`${styles.slide} ${styles.builderRevealSlide}`}>
                        <Confetti />
                        <p className={styles.slideLabel}>Legendary Status</p>
                        <div className={styles.shippedEmoji}>
                            <LucideIcon name="Hammer" size={80} />
                        </div>
                        <h2 className={styles.shippedTitle}>YOU SHIPPED</h2>
                        <p className={styles.slideSubtitle}>
                            <CountUp end={stats.builder.contractsDeployed} duration={3000} /> contract{stats.builder.contractsDeployed > 1 ? 's' : ''} deployed on Base
                        </p>
                        <div className={styles.deployedList}>
                            {stats.builder.deployedContracts.slice(0, 3).map((contract, idx) => (
                                <div key={idx} className={styles.deployedContract}>
                                    <span className={styles.contractAddress}>
                                        {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                                    </span>
                                    <span className={styles.contractDate}>{contract.date}</span>
                                </div>
                            ))}
                        </div>
                        <p className={styles.builderNote}>
                            You&apos;re not just a user. You&apos;re a builder. 🚀
                        </p>
                    </div>
                )}

                {slideType === 'milestones' && stats.milestones && (
                    <div className={`${styles.slide} ${styles.milestonesSlide}`}>
                        <p className={styles.slideLabel}>Your Achievements</p>
                        <h3 className={styles.slideTitle}>Badges Earned</h3>
                        <div className={styles.badgesList}>
                            {stats.milestones.filter(m => m.achieved).map((milestone) => (
                                <div key={milestone.id} className={styles.badge}>
                                    <span className={styles.badgeEmoji}>
                                        <LucideIcon name={milestone.emoji} size={28} />
                                    </span>
                                    <div className={styles.badgeInfo}>
                                        <span className={styles.badgeTitle}>{milestone.title}</span>
                                        <span className={styles.badgeDesc}>{milestone.description}</span>
                                    </div>
                                </div>
                            ))}
                            {stats.milestones.filter(m => m.achieved).length === 0 && (
                                <p className={styles.noBadges}>Keep building to earn badges!</p>
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
                            <div className={styles.noScore}>
                                <p>Builder Score not active</p>
                                <div className={styles.scoreCircle} style={{ opacity: 0.5 }}>
                                    <span className={styles.scoreValue}>0</span>
                                </div>
                                <p className={styles.funFact}>Claim your score at talent.protocol</p>
                            </div>
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
                                        <span>{formatAccountSource(acc.source)}</span>
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

                {slideType === 'farcaster' && stats.farcaster && (
                    <div className={`${styles.slide} ${styles.farcasterSlide}`}>
                        <p className={styles.slideLabel}>Your Farcaster Presence</p>
                        {stats.farcaster.pfpUrl && (
                            <Image
                                src={stats.farcaster.pfpUrl}
                                alt="Profile"
                                width={80}
                                height={80}
                                className={styles.farcasterPfp}
                            />
                        )}
                        <h2 className={styles.farcasterUsername}>@{stats.farcaster.username}</h2>
                        {stats.farcaster.displayName && stats.farcaster.displayName !== stats.farcaster.username && (
                            <p className={styles.farcasterDisplayName}>{stats.farcaster.displayName}</p>
                        )}
                        <div className={styles.farcasterStats}>
                            <div className={styles.farcasterStat}>
                                <span className={styles.farcasterStatValue}>{formatNumber(stats.farcaster.followerCount)}</span>
                                <span className={styles.farcasterStatLabel}>Followers</span>
                            </div>
                            <div className={styles.farcasterStat}>
                                <span className={styles.farcasterStatValue}>{formatNumber(stats.farcaster.followingCount)}</span>
                                <span className={styles.farcasterStatLabel}>Following</span>
                            </div>
                            {stats.farcaster.totalCasts2025 !== undefined && (
                                <div className={styles.farcasterStat}>
                                    <span className={styles.farcasterStatValue}>{stats.farcaster.totalCasts2025}</span>
                                    <span className={styles.farcasterStatLabel}>Casts</span>
                                </div>
                            )}
                        </div>
                        {stats.farcaster.hasPowerBadge && (
                            <p className={styles.funFact}>
                                <span className={styles.icon}>{Icons.star}</span>
                                Power Badge Holder
                            </p>
                        )}
                        {stats.farcaster.topChannels && stats.farcaster.topChannels.length > 0 && (
                            <div className={styles.farcasterChannels}>
                                <p className={styles.accountsLabel}>Top Channels</p>
                                <div className={styles.accountsList}>
                                    {stats.farcaster.topChannels.slice(0, 4).map((channel) => (
                                        <div key={channel} className={styles.accountBadge}>
                                            /{channel}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {slideType === 'summary' && (
                    <div className={`${styles.slide} ${styles.summarySlide}`}>
                        <p className={styles.slideLabel}>That&apos;s a Wrap!</p>
                        <h2 className={styles.summaryTitle}>See you in 2026 🔵</h2>

                        <div className={styles.summaryCard}>
                            <div className={styles.summaryRow}>
                                <span>Transactions</span>
                                <span>{stats.totalTransactions}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Top Rank</span>
                                <span>{stats.percentile ? (100 - stats.percentile.overall).toFixed(0) : '?'}%</span>
                            </div>
                            <div className={styles.summaryArchetype}>
                                {stats.personality?.title}
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            {!isMintSuccess ? (
                                <button
                                    className={styles.mintButton}
                                    onClick={handleMint}
                                    disabled={isMintPending || isConfirming}
                                >
                                    <LucideIcon name="Diamond" size={20} />
                                    {isMintPending || isConfirming ? 'Minting...' : 'Mint NFT (0.0001 ETH)'}
                                </button>
                            ) : (
                                <button className={styles.mintButton} disabled>
                                    <LucideIcon name="Check" size={20} />
                                    Minted!
                                </button>
                            )}

                            <button className={styles.downloadButton} onClick={handleDownload}>
                                <LucideIcon name="Image" size={20} />
                                Save Card
                            </button>
                            <button className={styles.shareButton} onClick={handleShare}>
                                <LucideIcon name="Share2" size={20} />
                                Share on Farcaster
                            </button>
                        </div>
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
        </div >
    );
}
