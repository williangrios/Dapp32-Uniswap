//libs
import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

//css
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

//components
import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRContent from 'wrcomponents/dist/WRContent';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRTools from 'wrcomponents/dist/WRTools';
import Button from "react-bootstrap/Button";
import TradeBox from "./components/TradeBox";

//assets
import meta from "./assets/metamask.png";

//infos
const  INFURA_URL ="https://mainnet.infura.io/v3/7abcaefccf2a47e89fddeec51e91feb2"

function App() {
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({account: '', connected: false});
  const [provider, setProvider] = useState();
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {

    async function getProvider() {
      const prov =  new ethers.providers.JsonRpcProvider(INFURA_URL);
      setProvider(prov);

      // const contr = new ethers.Contract(contractAddress, ICOContract.abi, prov);
      // setContract(contr);  
    }
    
    getProvider()

  }, [])
  

  async function handleConnectWallet (){
    try {
      if (! await isEthereumMainnet()){
        toastMessage('Change to ethereum mainnet.')
        return;
      }

      const provWeb3 =  new ethers.providers.Web3Provider(window.ethereum);
      let userAcc = await provWeb3.send('eth_requestAccounts', []);
      setUser({account: userAcc[0], connected: true});

      // const contrSig = new ethers.Contract(contractAddress, LotteryContract.abi, provider.getSigner())
      // setSigner( contrSig)
    } catch (error) {
      if (error.message === 'provider is undefined'){
        toastMessage('No provider detected.')
      } else if(error.code === -32002){
        toastMessage('Check your metamask')
      }
      console.log(error);
    } finally{
      setLoading(false);
    }
  }

  function isConnected(){
    if (!user.connected){
      toastMessage('You are not connected!')
      return false;
    }
    return true;
  }

  async function isEthereumMainnet(){
    const ethereumChainId = "0x5";
    const respChain = await getChain();
    console.log(respChain);
    return ethereumChainId === respChain;
  }

  async function getChain() {
    const currentChainId = await  window.ethereum.request({method: 'eth_chainId'})
    return currentChainId;
  }
  
  async function handleDisconnect(){
    try {
      setUser({account: '', connected: false});
      setSigner(null);
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="UNISWAP - SWAP TOKENS" image={true} />
      <WRInfo chain="Goerli" testnet={true}/>
      <WRContent>
        <h1>Connect to Goerli testnet</h1>
        { !user.connected ?<>
            <Button variant="btn btn-primary" onClick={handleConnectWallet}>
              <img src={meta} alt="metamask" width="30px" height="30px"/>Connect Metamask
            </Button></>
          : <>
            <label>Welcome {user.account}</label>
            <button className="btn btn-primary commands" onClick={handleDisconnect}>Disconnect</button>
          </>
        }
        <TradeBox user={user} provider={provider} toast={toast}/>
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} ethersjs={true} />
      <WRFooter />  
    </div>
  );
}

export default App;
