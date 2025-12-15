export const BaseWrappedABI = [
    {
        inputs: [],
        name: "mint",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256"
            }
        ],
        name: "Minted",
        type: "event"
    }
] as const;
