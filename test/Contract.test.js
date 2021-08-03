const { assert } = require('chai')
const truffleAssert = require('truffle-assertions')

const Contract = artifacts.require('./FuzzyHat.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Contract', (accounts) => {
    const fuzzyhat = accounts[0]
    const nonAdmin = accounts[1]
    const metadataUri = 'metadata-uri'

    let contract

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

    describe('minting', async () => {

        it('non-admin fails to mint', async () => {
            const beforeMintTokenIds = await contract.getTokensOfOwner(nonAdmin)
            assert.equal(beforeMintTokenIds.length, 0)
            
            await truffleAssert.fails(
                contract.mintToken(metadataUri, {from: nonAdmin}),
                truffleAssert.ErrorType.REVERT,
                'Only admins.'
            )
        })

        it('can mint successfully', async () => {
            const beforeMintTokenIds = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(beforeMintTokenIds.length, 0)

            let nextTokenId = await contract.nextTokenId()
            assert.equal(nextTokenId.toString(), web3.utils.toBN(1).toString())

            const mintTransaction = await contract.mintToken(metadataUri)

            truffleAssert.eventEmitted(mintTransaction, 'Transfer', {to: fuzzyhat, tokenId: nextTokenId})

            let tokenUri = await contract.tokenURI(nextTokenId)
            assert.equal(tokenUri, metadataUri)

            nextTokenId = await contract.nextTokenId()
            assert.equal(nextTokenId.toString(), web3.utils.toBN(2).toString())

            const afterMintTokenIds = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(afterMintTokenIds.length, 1)
        })

        it('can mint a 2nd successfully', async () => {
            const beforeMintTokenIds = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(beforeMintTokenIds.length, 1)

            let nextTokenId = await contract.nextTokenId()
            assert.equal(nextTokenId.toString(), web3.utils.toBN(2).toString())

            const mintTransaction = await contract.mintToken(metadataUri)

            truffleAssert.eventEmitted(mintTransaction, 'Transfer', {to: fuzzyhat, tokenId: nextTokenId})

            let tokenUri = await contract.tokenURI(nextTokenId)
            assert.equal(tokenUri, metadataUri)

            nextTokenId = await contract.nextTokenId()
            assert.equal(nextTokenId.toString(), web3.utils.toBN(3).toString())

            const afterMintTokenIds = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(afterMintTokenIds.length, 2)
        })

        it('can mint a 3rd successfully', async () => {
            const beforeMintTokenIds = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(beforeMintTokenIds.length, 2)

            let nextTokenId = await contract.nextTokenId()
            assert.equal(nextTokenId.toString(), web3.utils.toBN(3).toString())

            const mintTransaction = await contract.mintToken(metadataUri)

            truffleAssert.eventEmitted(mintTransaction, 'Transfer', {to: fuzzyhat, tokenId: nextTokenId})

            let tokenUri = await contract.tokenURI(nextTokenId)
            assert.equal(tokenUri, metadataUri)

            nextTokenId = await contract.nextTokenId()
            assert.equal(nextTokenId.toString(), web3.utils.toBN(4).toString())

            const afterMintTokenIds = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(afterMintTokenIds.length, 3)
        })
    })

    describe('burning', async () => {

        it('non-admin fails to burn an owned token', async () => {
            const fuzzyhatBeforeTokens = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(fuzzyhatBeforeTokens.length, 3)

            const nonAdminBeforeTokens = await contract.getTokensOfOwner(nonAdmin)
            assert.equal(nonAdminBeforeTokens.length, 0)

            const transferTransaction = await contract.transferFrom(fuzzyhat, nonAdmin, '2')

            truffleAssert.eventEmitted(transferTransaction, 'Approval', {owner: fuzzyhat, tokenId: web3.utils.toBN(2)})
            truffleAssert.eventEmitted(transferTransaction, 'Transfer', {to: nonAdmin, from: fuzzyhat, tokenId: web3.utils.toBN(2)})

            const fuzzyhatAfterTokens = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(fuzzyhatAfterTokens.length, 2)

            const nonAdminAfterTokens = await contract.getTokensOfOwner(nonAdmin)
            assert.equal(nonAdminAfterTokens.length, 1)

            await truffleAssert.fails(
                contract.burn('2', {from: nonAdmin}),
                truffleAssert.ErrorType.REVERT,
                'Only admins.'
            )

            const nonAdminAfterFailedBurnTokens = await contract.getTokensOfOwner(nonAdmin)
            assert.equal(nonAdminAfterFailedBurnTokens.length, 1)
        })

        it('can succesfully burn token if admin owns it', async () => {
            const fuzzyhatBeforeTokens = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(fuzzyhatBeforeTokens.length, 2)

            await truffleAssert.passes(
                contract.burn('3')
            )

            const fuzzyhatAfterTokens = await contract.getTokensOfOwner(fuzzyhat)
            assert.equal(fuzzyhatAfterTokens.length, 1)
        })
    })

    describe('retrieving data', async () => {

        it('can get tokenURI', async () => {
            const tokenUri = await contract.tokenURI('1')
            assert.equal(tokenUri, metadataUri)
        })

        it('cannot get tokenURI from invalid token', async () => {
            await truffleAssert.fails(
                contract.tokenURI('3'),
                truffleAssert.ErrorType.REVERT,
                'Token ID does not exist.'
            )
        })

        it('can get owner', async () => {
            const owner = await contract.owner()
            assert.equal(owner, fuzzyhat)
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

        it('can add a new admin', async () => {
            await truffleAssert.passes(
                contract.addAdmin(accounts[3])
            )

            await truffleAssert.passes(
                contract.addAdmin(accounts[4])
            )
        })

        it('non-admin cannot remove admin', async () => {
            await truffleAssert.fails(
                contract.removeAdmin(accounts[3], {from: nonAdmin}),
                truffleAssert.ErrorType.REVERT,
                'Only admins.'
            )
        })

        it('can remove admin', async () => {
            await truffleAssert.passes(
                contract.removeAdmin(accounts[3], {from: accounts[4]})
            )

            await truffleAssert.passes(
                contract.removeAdmin(accounts[4])
            )
        })

        it('non-admin cannot update contract uri', async () => {
            let contractUri = await contract.contractURI()
            assert.equal(contractUri, '')

            await truffleAssert.fails(
                contract.updateContractUri('contract-uri', {from: nonAdmin}),
                truffleAssert.ErrorType.REVERT,
                'Only admins.'
            )

            contractUri = await contract.contractURI()
            assert.equal(contractUri, '')
        })

        it('can update contract uri', async () => {
            let contractUri = await contract.contractURI()
            assert.equal(contractUri, '')

            await truffleAssert.passes(
                contract.updateContractUri('contract-uri')
            )

            contractUri = await contract.contractURI()
            assert.equal(contractUri, 'contract-uri')
        })

        it('non-admin cannot update payout address', async () => {
            let payoutAddress = await contract.payoutAddress()
            assert.equal(payoutAddress, fuzzyhat)

            await truffleAssert.fails(
                contract.updatePayoutAddress(accounts[9], {from: nonAdmin}),
                truffleAssert.ErrorType.REVERT,
                'Only admins.'
            )

            payoutAddress = await contract.payoutAddress()
            assert.equal(payoutAddress, fuzzyhat)
        })

        it('can update payout address', async () => {
            let payoutAddress = await contract.payoutAddress()
            assert.equal(payoutAddress, fuzzyhat)

            await truffleAssert.passes(
                contract.updatePayoutAddress(accounts[9])
            )

            payoutAddress = await contract.payoutAddress()
            assert.equal(payoutAddress, accounts[9])
        })

        it('non-admin cannot update token metadata', async () => {
            await truffleAssert.fails(
                contract.updateTokenMetadata('1', 'update', false, {from: nonAdmin}),
                truffleAssert.ErrorType.REVERT,
                'Only admins.'
            )
        })

        it('can update token metadata', async () => {
            await truffleAssert.passes(
                contract.updateTokenMetadata('1', 'update', false)
            )

            let tokenUri = await contract.tokenURI('1')
            assert.equal(tokenUri, 'update')

            const updateMetadataWithEvent = await contract.updateTokenMetadata('1', 'update2', true)

            truffleAssert.eventEmitted(updateMetadataWithEvent, 'PermanentURI', {_value: 'update2', _id: web3.utils.toBN(1)})
            
            tokenUri = await contract.tokenURI('1')
            assert.equal(tokenUri, 'update2')
        })
    })

    describe('royalties', async () => {

        it('rariable can get royalties', async () => {
            const recipients = await contract.getFeeRecipients('1')
            assert.equal(recipients[0], accounts[9])

            const bps = await contract.getFeeBps('1')
            assert.equal(bps[0], 1000)
        })
    })
})