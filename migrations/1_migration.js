const Contract = artifacts.require('FuzzyHat')

module.exports = function (deployer, network, accounts) {
    deployer.deploy(Contract);
}