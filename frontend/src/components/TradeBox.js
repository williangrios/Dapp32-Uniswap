//libs
import React, {useState, useEffect} from 'react'
import { ethers } from "ethers";

//css
import styles from './TradeBox.module.css'

import WRSWAPV3 from '../artifacts/contracts/WRSwapV3.sol/WRSwapV3.json'
import IERC20 from '../artifacts/contracts/IERC20.sol/IERC20.json'

const TradeBox = ({user, provider, toast}) => {

  //constants
  const  WETH_CONTRACT = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
  const  USDC_CONTRACT = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
  const  LINK_CONTRACT = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"

  const SWAP_V3_ADDRESS ="0xBD1e19D3f581F273FFa640f32699cdE70e63a895"

  const [mainToken, setMainToken] = useState([{
      ticker: "LINK",
      contract: LINK_CONTRACT,
    },
    {
      ticker: "USDC",
      contract: USDC_CONTRACT
    },
    {
      ticker: "WETH",
      contract: WETH_CONTRACT
    }
  ])

  const [tokenIn, setTokenIn] = useState({indexTicker: 2, ticker: mainToken[2].ticker, contract: mainToken[2].contract, balance: 2, amount: 0, allowed: 0})
  const [tokenOut, setTokenOut] = useState({indexTicker: 1, ticker: mainToken[1].ticker, contract: mainToken[1].contract, balance: 0, amount: 0, allowed: 0})

  const [signer, setSigner] = useState()
  const [loadingBalance, setLoadingBalance] = useState(false)

  useEffect(() => {
    isUserLoggedIn()
    handleSelectToken("IN", tokenIn.indexTicker, tokenIn.ticker, tokenIn.amount)
  }, [user])

  function toastMessage(text) {
    toast.info(text)  ;
  }

  async function getSigner(){
    if (!signer){
      const provWeb3 =  new ethers.providers.Web3Provider(window.ethereum);
      const sig = provWeb3.getSigner(user.account)
      setSigner(sig)
    }else{
      return (signer)
    }
  }

  function isUserLoggedIn() {
    if(!user.connected){
      setTokenIn( {...tokenIn, amount: 0, balance: 0 , allowed: 0} )
      return false
    }else{
      return true
    }
  }
 

  async function handleSelectToken(InOut, indexTicker, ticker, amount = 0) {
    if (ticker === 'OTHER'){
      const newToken ={ indexTicker , ticker: "OTHER", contract: "" , balance: 0, amount: 0, allowed: 0}
      InOut === "IN" ? setTokenIn(newToken) : setTokenOut(newToken);
      return
    }

    if (InOut === "IN"){
      const balanceToken = await getBalance(mainToken[indexTicker].contract, user.account)
      const allowed = await getAmountAllowed(mainToken[indexTicker].contract, user.account)
      const newTokenIn ={ indexTicker , ticker, contract: mainToken[indexTicker].contract , balance: balanceToken, amount, allowed}
      setTokenIn(newTokenIn);
    }else if (InOut ==="OUT"){
      const newTokenOut ={ indexTicker , ticker, contract: mainToken[indexTicker].contract , balance: 0, amount, allowed: 0}
      setTokenOut(newTokenOut);
    }
  }

  async function handleOtherToken(InOut, contractAddress) {
    if (InOut ==="IN"){
      setTokenIn({...tokenIn, contract: contractAddress})
    }else if (InOut === "OUT"){
      setTokenOut({...tokenIn, contract: contractAddress})
    }
    if (contractAddress.length !== 42){
      return
    }
    try{
      setLoadingBalance(true)
      const balanceToken = await getBalance(contractAddress, user.account)
      const allowed = await getAmountAllowed(contractAddress, user.account)
      if (InOut === "IN"){
        setTokenIn({...tokenIn, contract: contractAddress , balance: balanceToken, allowed: allowed})
      }else if (InOut === "OUT"){
        setTokenOut({...tokenOut, contract: contractAddress , balance: balanceToken, allowed: allowed})
      }
    }catch(error){
      console.log(error);
    }finally{
      setLoadingBalance(false)
    }

    
  }

  async function returnContractERC20Instance(contractAddress){
    const sign = await getSigner()
    const instanceContractToken = new ethers.Contract(contractAddress.toString(), IERC20.abi, sign )
    return instanceContractToken
  }

  async function getBalance(contractAddress, accountUser) {
    if(!isUserLoggedIn()){
      return 0
    }
    
    try{
      setLoadingBalance(true)
      const instanceContractToken = await returnContractERC20Instance(contractAddress)
      const tokenAmount = await instanceContractToken.balanceOf(accountUser.toString())
      return tokenAmount.toString()
    }catch(e){
      console.log(e);
      if (e.code === 'CALL_EXCEPTION') return 'Contract not found'
      if (e.code === 'INVALID_ARGUMENT') return 'Invalid contract'
    }finally{
      setLoadingBalance(false)
    }
  }
  
  async function getAmountAllowed(contractAddress, accountUser) {
    if(!isUserLoggedIn()){
      return 0
    }
    
    try{
      setLoadingBalance(true)
      const sign = await getSigner()
      const instanceContractToken = new ethers.Contract(contractAddress.toString(), IERC20.abi, sign )
      const tokenAllowance = await instanceContractToken.allowance(accountUser.toString(), SWAP_V3_ADDRESS)
      return tokenAllowance.toString()
    }catch(e){
      console.log(e);
      if (e.code === 'CALL_EXCEPTION') return 'Contract not found'
      if (e.code === 'INVALID_ARGUMENT') return 'Invalid contract'
    }finally{
      setLoadingBalance(false)
    }
  }

  async function handleApprove(e) {
    //e.preventDefault()
    if(!isUserLoggedIn()){
      return 0
    }
    
    try{
      setLoadingBalance(true)
      const instanceContractToken = await returnContractERC20Instance(tokenIn.contract)
      const res = await instanceContractToken.approve(SWAP_V3_ADDRESS, tokenIn.amount)
      await res.wait();
      toastMessage("Now is allowed to trade.")

    }catch(e){
      console.log(e);
      if (e.code === 'CALL_EXCEPTION') return 'Contract not found'
      if (e.code === 'INVALID_ARGUMENT') return 'Invalid contract'
    }finally{
      setLoadingBalance(false)
    }

  }

  async function handleSwap(e) {
    e.preventDefault()

    try {

      const sign = await getSigner()
      const contrSwapV3 = new ethers.Contract(SWAP_V3_ADDRESS, WRSWAPV3.abi, sign )
      const amountOut = await contrSwapV3.swapExactInputSingle(tokenIn.contract, tokenOut.contract, tokenIn.amount);  
      await amountOut.wait()
      console.log();

      toastMessage("Traded sucessfully!")
    } catch (error) {
      console.log('erro');
      console.log(error);
    }
    
  }
  
  function changeTokensInOut(e){
    const tIn = tokenIn;
    const tOut = tokenOut;
    setTokenIn({...tOut})
    setTokenOut({...tIn})
    handleSelectToken("IN", tOut.indexTicker, tokenOut.ticker, tOut.amount)
  }

  return (
    <div className={styles.tradebox}>
        <h2>Convert</h2>
        <form onSubmit={handleSwap}>
            <div className={styles.internal_box}>
            <p>Select token (In)</p>
                <select onChange={(e) => handleSelectToken("IN" ,e.target.selectedIndex, e.target.value, tokenIn)} value={tokenIn.ticker}>
                    <option value={mainToken[0].ticker}>{mainToken[0].ticker}</option>
                    <option value={mainToken[1].ticker}>{mainToken[1].ticker}</option>
                    <option value={mainToken[2].ticker}>{mainToken[2].ticker}</option>
                    <option value='OTHER'>OTHER</option>
                </select>
                { tokenIn.ticker === 'OTHER' &&
                    <>
                        <p>Contract</p>
                        <input type='text' onChange={(e) => handleOtherToken("IN", e.target.value)} value={tokenIn.contract}/>
                    </>
                }
                <p>Balance</p>
                <p>{ loadingBalance ? 'Loading...' : tokenIn.balance}</p>
                <p>Allowed</p>
                <p>{ loadingBalance ? 'Loading...' : tokenIn.allowed}</p>
                <p>Amount</p> 
                <input type='number' onChange={(e) => setTokenIn({...tokenIn, amount: e.target.value})} value={tokenIn.amount}/>
            </div>
        </form>
        <div className={styles.arrow_box} onClick={changeTokensInOut}></div>
        <form>
            <div className={styles.internal_box}>
                <p>Select token (Out)</p>
                <select onChange={(e) => handleSelectToken("OUT", e.target.selectedIndex, e.target.value)} value={tokenOut.ticker}>
                    <option value={mainToken[0].ticker}>{mainToken[0].ticker}</option>
                    <option value={mainToken[1].ticker}>{mainToken[1].ticker}</option>
                    <option value={mainToken[2].ticker}>{mainToken[2].ticker}</option>
                    <option value='OTHER'>OTHER</option>
                </select>
                { tokenOut.ticker === 'OTHER' &&
                    <>
                        <p>Contract</p>
                        <input type='text' onChange={(e) => handleOtherToken("OUT", e.target.value)} value={tokenOut.contract}/>
                    </>
                }
            </div>
        </form>

        {(tokenIn.allowed < tokenIn.amount && user.connected )&&
          <button className='btn btn-primary' onClick={handleApprove}>Approve</button>
        }

        {tokenIn.allowed >= tokenIn.amount &&
          <button className='btn btn-primary'  onClick={handleSwap}>Trade tokens</button>
        }
    </div>
  )
}

export default TradeBox