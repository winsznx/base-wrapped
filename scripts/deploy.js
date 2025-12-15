const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const initialBaseURI = "https://base-wrapped-nine.vercel.app/api/metadata/";

    const BaseWrapped2025 = await hre.ethers.getContractFactory("BaseWrapped2025");
    const baseWrapped = await BaseWrapped2025.deploy(initialBaseURI);

    await baseWrapped.waitForDeployment();

    const address = await baseWrapped.getAddress();

    console.log("BaseWrapped2025 deployed to:", address);
    console.log("Base URI set to:", initialBaseURI);

    // Wait for a few block confirmations
    console.log("Waiting for block confirmations...");
    await baseWrapped.deploymentTransaction().wait(5);

    console.log("Contract deployed and confirmed. Ready for verification.");
    console.log(`Verify with: npx hardhat verify --network base ${address} "${initialBaseURI}"`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
