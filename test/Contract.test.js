const { assert } = require('chai')
const truffleAssert = require('truffle-assertions')

const Contract = artifacts.require('./FuzzyHat.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Contract', (accounts) => {
    const fuzzyhat = accounts[0];
    const nonAdmin = accounts[1];

    let contract;

    before(async () => {
        contract = await Contract.deployed()
    })

    describe('deployment', async () => {

        it('deploys successful', async () => {
            const address = contract.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe('contract updates', async () => {

        it('non-admin fails add admin', async () => {
            await truffleAssert.fails(
                contract.addAdmin(nonAdmin, {from: nonAdmin}),
                truffleAssert.ErrorType.REVERT,
                'Only admins.'
            )
        })
    })
})