"use client";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useConnect } from "wagmi";
import Image from "next/image";
import { IntroAnimation } from "@/components/IntroAnimation";
import { WrappedStats } from "@/components/WrappedStats";
import { WrappedStats as WrappedStatsType } from "@/lib/stats";
import styles from "@/app/page.module.css";

type ViewState = 'intro' | 'landing' | 'loading' | 'wrapped';

// SVG Icons
const Icons = {
    transactions: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    gas: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18H4z" />
            <path d="M18 14h1a2 2 0 0 1 2 2v3a2 2 0 0 0 4 0v-5a2 2 0 0 0-2-2h-3" />
            <path d="M4 12h12" />
        </svg>
    ),
    nft: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    ),
    trophy: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    ),
    wallet: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
    ),
};

export default function HomeClient() {
    const { address: connectedAddress, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const [isFrameReady, setFrameReady] = useState(false);
    const [viewState, setViewState] = useState<ViewState>('intro');
    const [stats, setStats] = useState<WrappedStatsType | null>(null);
    const [error, setError] = useState("");
    const [manualAddress, setManualAddress] = useState("");
    const [showAddressInput, setShowAddressInput] = useState(false);

    // Initialize the miniapp
    useEffect(() => {
        if (!isFrameReady) {
            setFrameReady();
        }
    }, [setFrameReady, isFrameReady]);

    const handleIntroComplete = useCallback(() => {
        setViewState('landing');
    }, []);

    const fetchStats = useCallback(async (userAddress: string) => {
        setViewState('loading');
        setError("");

        try {
            const response = await fetch(`/api/wrapped?address=${userAddress}`);
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
                setViewState('wrapped');

                // Show message if no transactions found
                if (data.message) {
                    console.log(data.message);
                }
            } else {
                setError(data.error || "Failed to fetch stats");
                setViewState('landing');
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
            setError("Failed to load your wrapped. Please try again.");
            setViewState('landing');
        }
    }, []);

    const handleGetWrapped = () => {
        if (isConnected && connectedAddress) {
            fetchStats(connectedAddress);
        } else if (manualAddress && /^0x[a-fA-F0-9]{40}$/.test(manualAddress)) {
            fetchStats(manualAddress);
        } else {
            setShowAddressInput(true);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualAddress && /^0x[a-fA-F0-9]{40}$/.test(manualAddress)) {
            fetchStats(manualAddress);
        } else {
            setError("Please enter a valid Ethereum address (0x...)");
        }
    };

    const handleBackToLanding = () => {
        setViewState('landing');
        setStats(null);
        setError("");
    };

    // Intro animation
    if (viewState === 'intro') {
        return <IntroAnimation onComplete={handleIntroComplete} />;
    }

    // Loading state
    if (viewState === 'loading') {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <div className={styles.loadingSpinner}></div>
                    <h2 className={styles.loadingTitle}>Unwrapping your 2025...</h2>
                    <p className={styles.loadingSubtitle}>
                        Fetching your onchain activity from Base
                    </p>
                </div>
            </div>
        );
    }

    // Wrapped view
    if (viewState === 'wrapped' && stats) {
        return (
            <div className={styles.wrappedContainer}>
                <button className={styles.backButton} onClick={handleBackToLanding}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
                <WrappedStats stats={stats} />
            </div>
        );
    }

    // Landing page
    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/base-square.svg"
                        alt="Base"
                        width={80}
                        height={80}
                        className={styles.logo}
                        priority
                    />
                </div>

                <h1 className={styles.title}>Your Year on Base</h1>
                <p className={styles.subtitle}>2025 Onchain Wrapped</p>

                <p className={styles.description}>
                    See what you built. Your transactions, gas spent, dApps,
                    NFTs, and Builder Score — all in one place.
                </p>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.buttonGroup}>
                    {isConnected ? (
                        <button
                            className={styles.primaryButton}
                            onClick={handleGetWrapped}
                        >
                            <span className={styles.buttonIcon}>{Icons.wallet}</span>
                            Get My Wrapped
                        </button>
                    ) : showAddressInput ? (
                        <form onSubmit={handleManualSubmit} className={styles.addressForm}>
                            <input
                                type="text"
                                placeholder="Enter wallet address (0x...)"
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                className={styles.addressInput}
                                autoFocus
                            />
                            <button type="submit" className={styles.primaryButton}>
                                Get Wrapped
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* Primary: Connect Wallet button (for Farcaster/Base wallet) */}
                            {connectors.length > 0 && (
                                <button
                                    className={styles.primaryButton}
                                    onClick={() => connect({ connector: connectors[0] })}
                                >
                                    <span className={styles.buttonIcon}>{Icons.wallet}</span>
                                    Connect Wallet
                                </button>
                            )}

                            {/* Secondary: Manual address entry */}
                            <button
                                className={styles.secondaryButton}
                                onClick={() => setShowAddressInput(true)}
                            >
                                Enter Wallet Address
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.previewStats}>
                    <div className={styles.previewStat}>
                        <span className={styles.previewIcon}>{Icons.transactions}</span>
                        <span>Transactions</span>
                    </div>
                    <div className={styles.previewStat}>
                        <span className={styles.previewIcon}>{Icons.gas}</span>
                        <span>Gas Spent</span>
                    </div>
                    <div className={styles.previewStat}>
                        <span className={styles.previewIcon}>{Icons.nft}</span>
                        <span>NFTs</span>
                    </div>
                    <div className={styles.previewStat}>
                        <span className={styles.previewIcon}>{Icons.trophy}</span>
                        <span>Top dApps</span>
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>Built on Base</p>
                <p className={styles.footerLinks}>
                    Powered by Talent Protocol & Routescan
                </p>
                <a href="/about" className={styles.aboutLink}>About Base Wrapped</a>
            </footer>
        </div>
    );
}
