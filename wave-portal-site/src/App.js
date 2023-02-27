import "./App.css";
import React, { useEffect, useState } from "react";
// import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const ethers = require("ethers");

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);

  const contractAddress = "0x46B7912EC550aC5E4Ac1dF8684F3143aC729E46D";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have METAMASK");
        return;
      } else {
        console.log("We have an ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        let account = accounts[0];
        console.log("Found an authorised account: ", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorised account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    setLoader(false);
    setError(false);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total waves: ", count.toNumber());

        const waveTxn = await wavePortalContract.wave("HELLO HELLO!", {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);
        setLoader(true);

        await waveTxn.wait();
        console.log("Mined...", waveTxn.hash);
        setLoader(false);
        getAllWaves();

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total waves: ", count.toNumber());
      } else {
        console.log("No ethereum object found");
      }
    } catch (error) {
      setLoader(false);
      setError(true);

      console.log("Wait for 10 minutes!");
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("newWave from: ", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      wavePortalContract.on("newWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("newWave", onNewWave);
      }
    };
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();

    console.log("GET ALL WAVES");
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>
        <div className="bio">
          I am Shruti Shrivastava and I am a self-taught game developer,
          dabbling with Unity, react.js and blockchain. <br></br>Connect your
          Ethereum wallet and wave at me to get some test ethers 😉
        </div>
        <div className="buttons">
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              CONNECT WALLET!!
            </button>
          )}
          <button className="waveButton" onClick={wave}>
            WAVE AT ME!!
          </button>
        </div>

        <div className="waveLog">
          <button onClick={getAllWaves}>VIEW WAVE LOG</button>
          {/* <div>
            <h1>Wave log</h1>
          </div> */}
          {allWaves.map((wave, index) => {
            return (
              <div
                key={index}
                style={{
                  color: "white",
                  marginTop: "16px",
                  padding: "8px",
                }}
              >
                <div>
                  <b>Waved by address: </b>
                  {wave.address}
                  <br></br>
                  <b>@</b> {wave.timestamp.toString()}
                </div>
                {/* <div>Message: {wave.message}</div>
              <div>Timestamp: {wave.timestamp.toString()}</div> */}
              </div>
            );
          })}
        </div>
        {loader && <h2>RECORDING YOUR WAVE...</h2>}
        {error && <h2>WAIT FOR 10 MINUTES BEFORE REQUESTING AGAIN!</h2>}
        {/* <h2>RECORDING YOUR WAVE...</h2> */}
      </div>
    </div>
  );
}

export default App;
