// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseWrapped2025
 * @dev Soulbound Token (SBT) for Base Wrapped 2025.
 * Non-transferable, Mint Price: 0.0001 ETH.
 */
contract BaseWrapped2025 is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MINT_PRICE = 0.0001 ether;
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    // Mapping to check if address has already minted
    mapping(address => bool) public hasMinted;

    event Minted(address indexed user, uint256 tokenId);
    event MetadataUpdate(uint256 indexed _tokenId);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(string memory initialBaseURI) ERC721("Base Wrapped 2025", "BW25") Ownable(msg.sender) {
        _baseTokenURI = initialBaseURI;
    }

    /**
     * @dev Mint a new Wrapped SBT. 
     * One per wallet. Cost: 0.0001 ETH.
     */
    function mint() external payable nonReentrant {
        require(msg.value >= MINT_PRICE, "Insufficient ETH sent");
        require(!hasMinted[msg.sender], "Already minted");

        uint256 tokenId = ++_nextTokenId;
        hasMinted[msg.sender] = true;
        
        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
    }

    /**
     * @dev Soulbound override: Prevent transfers.
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == 0) and burning (to == 0), but block transfers
        if (from != address(0) && to != address(0)) {
            revert("BaseWrapped: Token is Soulbound");
        }
        return super._update(to, tokenId, auth);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        // Emit event for marketplaces to refresh metadata (EIP-4906)
        emit MetadataUpdate(type(uint256).max);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
        emit Withdrawn(owner(), balance);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
