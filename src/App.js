import { recoverAddress } from "@ethersproject/transactions";
import { ethers, providers } from "ethers";
import React, { useEffect, useState } from "react";
import './App.css';
import abi from "./utils/WavePortal.json";

export const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = "0x3E4cb1d398f9E38C6b1d3fD4463014e07fce511e";
  const contractABI = abi.abi;
  const getAllWaves = async() => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {

    //make sure we have access to window.ethereum
    try {
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts"});
    
      if (accounts.length !== 0) {
        //grab first authorized account in wallet
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  //ethers library helps frontend talk to contract
  //provider used to talk to ethereum nodes - using metamask nodes to send/recieve data
  const wave = async () => {
    try {
      const { ethereum } = window;
      window.ethereum.enable()
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
        let count = await wavePortalContract.getTotalWaves();
        // let count_for_user = await wavePortalContract.getWaves();
        // console.log("Retrieved wave count for user...", count_for_user.toNumber());
        console.log("Retrieved total wave count...", count.toNumber());

        //execute the actual wave on the smart contract
        const waveTxn = await wavePortalContract.wave("this is a message");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        // count_for_user = await wavePortalContract.getWaves();
        // console.log("Retrieved wave count for user...", count_for_user.toNumber());
        console.log("Retrieved total wave count...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  class Waves extends React.Component {
    constructor(props) {
      super(props);
      this.state = {allWaves: allWaves}
    };

    render() {
      return (
        <div className="wavesContainer" style={{ backgroundColor: "gainsboro", padding:"8px", marginBottom: "20px" }}>
        <div className="allWaves" style={{ backgroundColor: "gainsboro", maginTop: "16px", marginBottom: "5px", padding: "8px" }}>
          Your Previous Waves
        </div>
    
        {allWaves.map((wave, index) => {
          return (
            <>
            <div key={index} style={{ backgroundColor: "Lavender", marginTop: "5px", marginBottom: "5px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>TimeL {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
            </>
          )
        })}
      </div>
      );
    }
  }
  //runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there.
        </div>

        <div className="bio">
        I'm feeling lonley. Give me a wave!
        </div>

        <button className="waveButton" onClick={wave} style={{ padding: "8px"}}>
          Wave at Me
        </button><br></br>

        {/* if there is no current account render this button */}
        {!currentAccount && (
          <button classNme="waveButton" onClick={connectWallet} style={{ padding: "8px"}}>
            Connect Wallet
          </button>
        )}
        {/* <div className="wavesContainer" style={{ backgroundColor: "gainsboro", padding:"8px", marginBottom: "20px" }}>
          <div className="allWaves" style={{ backgroundColor: "gainsboro", maginTop: "16px", marginBottom: "5px", padding: "8px" }}>
            Your Previous Waves
          </div>
          {allWaves.map((wave, index) => {
            return (
              <>
              <div key={index} style={{ backgroundColor: "Lavender", marginTop: "5px", marginBottom: "5px", padding: "8px"}}>
                <div>Address: {wave.address}</div>
                <div>TimeL {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
              </>
            )
          })}
        </div> */}
        <Waves></Waves>
      </div>
    </div>
  );
}
