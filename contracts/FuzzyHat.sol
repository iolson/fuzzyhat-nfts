// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FuzzyHat is ERC721Enumerable {
    using SafeMath for uint256;

    // ---
    // Constants
    // ---
    uint16 constant public royaltyFeeBps = 1000; // 10%
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    // ---
    // Properties
    // ---
    uint256 private invocations = 1;
    string private contractUri;
    address public payoutAddress;

    // ---
    // Events
    // ---
    event PermanentURI(string _value, uint256 indexed _id); // OpenSea Freezing Metadata

    // ---
    // Mappings
    // ---
    mapping(address => bool) private isAdmin;
    mapping(uint256 => string) private metadataByTokenId;

    // ---
    // Security
    // ---
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admins.");
        _;
    }

    modifier onlyValidTokenId(uint256 tokenId) {
        require(_exists(tokenId), "Token ID does not exist.");
        _;
    }

    // ---
    // Constructor
    // ---
    constructor() ERC721("FuzzyHat NFT", "FUZZYHATNFT") {
        isAdmin[msg.sender] = true;
        payoutAddress = msg.sender;
        // @TODO(iolson): Setup default contract URI data.
    }

    // ---
    // Supported Interfaces
    // ---
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        if (interfaceId == type(IERC165).interfaceId) {
            return true;
        }

        if (interfaceId == _INTERFACE_ID_ERC2981) {
            return true;
        }
        
        return false;
    }

    // ---
    // Minting
    // ---
    function mintToken(string memory metadataUri) public onlyAdmin returns (uint256 tokenId) {
        tokenId = invocations;
        invocations = invocations.add(1);
        _mint(msg.sender, tokenId);
        metadataByTokenId[tokenId] = metadataUri;
        emit PermanentURI(metadataUri, tokenId);
    }

    // ---
    // Burning
    // ---
    function burn(uint256 tokenId) public virtual onlyAdmin {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Only approved artist owners.");
        _burn(tokenId);
    }

    // ---
    // Metadata
    // ---
    function tokenURI(uint256 _tokenId) public view override virtual onlyValidTokenId(_tokenId) returns (string memory) {
        return metadataByTokenId[_tokenId];
    }

    function contractURI() public view virtual returns (string memory) {
        return contractUri;
    }

    // ---
    // Update Functions
    // ---
    function addAdmin(address addAddress) public onlyAdmin {
        isAdmin[addAddress] = true;
    }

    function removeAdmin(address removeAddress) public onlyAdmin {
        isAdmin[removeAddress] = false;
    }

    function updateContractUri(string memory updatedContractUri) public onlyAdmin {
        contractUri = updatedContractUri;
    }

    function updatePayoutAddress(address newPayoutAddress) public onlyAdmin {
        payoutAddress = newPayoutAddress;
    }

    // ---
    // Secondary Marketplace Functions
    // ---

    /* Rarible Royalties V1 */
    function getFeeRecipients(uint256 tokenId) public view onlyValidTokenId(tokenId) returns (address payable[] memory) {
        address payable[] memory recipients = new address payable[](1);
        recipients[0] = payable(payoutAddress);
        return recipients;
    }

    function getFeeBps(uint256 tokenId) public view onlyValidTokenId(tokenId) returns (uint[] memory) {
        uint256[] memory feeBps = new uint[](1);
        feeBps[0] = uint(royaltyFeeBps);
        return feeBps;
    }

    /* EIP-2981 */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view onlyValidTokenId(_tokenId) returns (address receiver, uint256 amount) {
        return (payoutAddress, _salePrice.div(100).mul(royaltyFeeBps));
    }
}