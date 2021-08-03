# FuzzyHat NFT Contracts

## Overview of Contract
This is a basic ERC-721 contract that will be deployed for my own personal NFT's. I'm trying to build out proper royalty payments for secondary sales from OpenSea, Rarible and EIP-2981 standard.

## Deploying
Migration/Deployment uses the following secret files:
- `.infura` - Infura API Application to talk to the blockchain
- `.secret` - Secret to use Metamask Wallet
- `.etherscan` - Holds Etherscan API Key to verify source code

# Development Environment
- Node
- NPM
- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)

## Development Commands
- `truffle compile` - Compiles Contracts
- `truffle migrate` - Runs migrations to the Blockchain
- `truffle run contract-size` - Outputs contract sizes since there are limits.
- `truffle test` - Runs the tests for the contracts