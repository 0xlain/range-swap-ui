import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { Button } from "@mui/material";
import { RANGEPOOL_CONTRACT } from "../utils/constants";

const injected = new InjectedConnector();

const ONBOARD_TEXT = "";
const CONNECT_TEXT = "CONNECT WALLET";

function shortenHex(hex, length = 4) {
  return `${hex.substring(0, length + 2)}…${hex.substring(
    hex.length - length
  )}`;
}

export default function ConnectWalletButton() {
  const { activate, account, library, chainId } = useWeb3React();

  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);

  useEffect(() => {
    if (account && chainId === 1) {
      RANGEPOOL_CONTRACT.setProvider(library.currentProvider);
      RANGEPOOL_CONTRACT.defaultAccount = account;
      setButtonText(shortenHex(account));
      setDisabled(true);
    } else if(account && chainId !== 1) {
      RANGEPOOL_CONTRACT.setProvider(null);
      RANGEPOOL_CONTRACT.defaultAccount = null;
      setButtonText("Please Connect To Ethereum Mainnet");
      setDisabled(true);
    } else {
      setButtonText(CONNECT_TEXT);
      setDisabled(false);
    }
  }, [account, chainId, library]);

  const onClick = async () => {
    if (window.ethereum) {
      await window.ethereum.enable();
      await injected.activate();
      const isAuthorized = await injected.isAuthorized();

      if (isAuthorized) {
        activate(injected, undefined, true).catch((error) => {
          console.error(error);
        });
      }
    }
  };

  const buttonBg = !account
    ? "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
    : " #59318C59  ";

  return (
    <Button
      variant="text"
      disabled={isDisabled}
      onClick={onClick}
      variant="contained"
      sx={{ background: buttonBg }}
    >
      {buttonText}
    </Button>
  );
}
