const {expect} = require ('chai')
const {ethers, network} = require ('hardhat')

const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f"
const DAI_Whale = "0x1B7BAa734C00298b9429b518D621753Bb0f6efF2"
// 0x66F62574ab04989737228D18C3624f7FC1edAe14


describe('TEST unlock account', function() {
    let accounts
    let dai
    let whale

    before (async () => {
        accounts = await ethers.getSigners()
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_Whale],
        })

        dai = await ethers.getContractAt("IERC20", DAI)

        whale = await ethers.getSigner(DAI_Whale)
    })

    it('unlocks accountsss', async () => {
        const amount = 10n * 10n ** 18n
        console.log('heres');
        // console.log(await dai.balanceOf(0x66F62574ab04989737228D18C3624f7FC1edAe14));
        //console.log("dai balance of whale is ", await dai.balanceOf(whale.address));
        //expect(await dai.balanceOf(whale.address)).to.gte(amount)
        //await dai.connect(whale).transfer(accounts[0].address, amount)
//        await dai.connect(whale).transfer(accounts[0].address, amount)

        console.log(accounts[0].address);
        const impersonatedSigner = await ethers.getImpersonatedSigner(DAI_Whale);
        await dai.connect(impersonatedSigner).transfer(accounts[0].address, amount)
        //await impersonatedSigner.sendTransaction(...);
        //console.log("dai balance of account is", await dai.balanceOf(accounts[0].address));
        //expect(await dai.balanceOf(whale.address)).to.gte(amount)
    })

})