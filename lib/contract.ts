/**
 * BaseWrapped2025 Contract Configuration
 */

export const BASE_WRAPPED_CONTRACT = {
    address: '0x4F432f03D06D183486AAa6FF76277B9f2B4D0FAb' as const,
    abi: [
        'function mint() external payable',
        'function hasMinted(address) external view returns (bool)',
        'function totalSupply() external view returns (uint256)',
        'function MINT_PRICE() external view returns (uint256)',
        'function tokenURI(uint256 tokenId) external view returns (string)',
        'function balanceOf(address owner) external view returns (uint256)',
        'function ownerOf(uint256 tokenId) external view returns (address)',
        'event Minted(address indexed user, uint256 tokenId)'
    ] as const,
    chainId: 8453, // Base Mainnet
    mintPrice: '0.0001' // ETH
} as const;

export const BASESCAN_URL = 'https://basescan.org';
export const CONTRACT_URL = `${BASESCAN_URL}/address/${BASE_WRAPPED_CONTRACT.address}`;
