"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./about.module.css";

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </Link>
            </header>

            <main className={styles.main}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/base-square.svg"
                        alt="Base"
                        width={64}
                        height={64}
                    />
                </div>

                <h1 className={styles.title}>About Base Wrapped</h1>

                <section className={styles.section}>
                    <h2>What Is This?</h2>
                    <p>
                        Base Wrapped is your personal year in review for 2025.
                        It shows your onchain activity on Base — transactions,
                        gas spent, dApps used, NFTs minted, and your Builder Score.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>How It Works</h2>
                    <p>
                        We fetch your public onchain data from Base and combine
                        it with your Talent Protocol profile to create a
                        personalized story of your year.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Data Sources</h2>
                    <div className={styles.sources}>
                        <div className={styles.source}>
                            <strong>Routescan</strong>
                            <span>Onchain transactions, gas, NFTs</span>
                        </div>
                        <div className={styles.source}>
                            <strong>Talent Protocol</strong>
                            <span>Builder Score, credentials, socials</span>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Privacy</h2>
                    <p>
                        We only read public blockchain data. No data is stored
                        on our servers. Everything runs client-side.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>Built on Base</h2>
                    <p>
                        This is an open-source Farcaster Mini App.
                        Built for the Base community.
                    </p>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>2025 OnChain Activity : Base Wrapped</p>
            </footer>
        </div>
    );
}
