const HDWalletProvider = require('truffle-hdwallet-provider');
const web3 = require('web3');
const fs = require('fs');
const infuraKey = fs.readFileSync(".infura").toString().trim();
const mnemonic = fs.readFileSync(".secret").toString().trim();
const etherscanKey = fs.readFileSync(".etherscan").toString().trim();

module.exports = {
    networks: {

        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },

        rinkeby: {
            provider: function () {
                return new HDWalletProvider(mnemonic,
                    "https://rinkeby.infura.io/v3/" + infuraKey, 3)
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: web3.utils.toWei('48', 'gwei'),
        },

        mainnet: {
            provider: function () {
                return new HDWalletProvider(mnemonic,
                    "https://mainnet.infura.io/v3/" + infuraKey, 3)
            },
            network_id: 1,
            gas: 4500000,
            gasPrice: web3.utils.toWei('47', 'gwei'),
            timeoutBlocks: 200
        }
    },

    compilers: {
        solc: {
            version: "0.8.0",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                evmVersion: "byzantium"
            }
        }
    },

    db: {
        enabled: false
    },

    plugins: [
        'truffle-contract-size',
        'truffle-plugin-verify'
    ],

    api_keys: {
        etherscan: etherscanKey
    }
};