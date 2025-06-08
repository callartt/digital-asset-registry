// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DigitalAsset is ERC721URIStorage {
    uint256 public nextTokenId;
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public tokenPrices;

    constructor() ERC721("DigitalAsset", "DAST") {}

    function mintAsset(address to, string memory tokenURI) external {
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        creators[tokenId] = msg.sender;
        nextTokenId++;
    }

    function unlistToken(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(tokenPrices[tokenId] > 0, "Token not listed");
        tokenPrices[tokenId] = 0;
    }

    function listTokenForSale(uint256 tokenId, uint256 priceInWei) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(priceInWei > 0, "Price must be greater than zero");
        tokenPrices[tokenId] = priceInWei;
    }

    function buyToken(uint256 tokenId) external payable {
        uint256 price = tokenPrices[tokenId];
        address seller = ownerOf(tokenId);

        require(price > 0, "Token not for sale");
        require(msg.value >= price, "Insufficient payment");
        require(seller != msg.sender, "Cannot buy your own token");

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(price);
        tokenPrices[tokenId] = 0;
    }

    function getPrice(uint256 tokenId) external view returns (uint256) {
        return tokenPrices[tokenId];
    }
}
