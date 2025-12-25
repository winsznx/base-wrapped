"use client";

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// 0. Setup queryClient
export const queryClient = new QueryClient()

// 1. Get projectId from https://dashboard.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

// 2. Create a metadata object
const metadata = {
    name: 'Base Wrapped 2025',
    description: 'Your 2025 on Base - Wrapped Stats',
    url: 'https://base-wrapped-nine.vercel.app',
    icons: ['https://base-wrapped-nine.vercel.app/icon.png']
}

// 3. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
    networks: [base],
    projectId,
    ssr: true
})

// 4. Create modal
createAppKit({
    adapters: [wagmiAdapter],
    networks: [base],
    projectId,
    metadata,
    features: {
        analytics: true
    }
})
