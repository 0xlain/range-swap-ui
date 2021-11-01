import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  MAINNET_ADDRESS,
  MIANNET_CONTRACT,
  ROPSTEN_ADDRESS,
  ROPSTEN_CONTRACT,
} from "../utils/constants";

export function useRangepool() {
  const { chainId, library } = useWeb3React();
  const [contract, setContract] = useState({
    RANGEPOOL_ADDRESS: MAINNET_ADDRESS,
    RANGEPOOL_CONTRACT: MIANNET_CONTRACT,
  });

  const getContractFee = async () => {
    const fee = await contract.RANGEPOOL_CONTRACT.methods.fee().call();
    setContract({ ...contract, CONTRACT_FEE: fee });
  };

  useEffect(() => {
    switch (chainId) {
      case 3:
        setContract({
          RANGEPOOL_ADDRESS: ROPSTEN_ADDRESS,
          RANGEPOOL_CONTRACT: ROPSTEN_CONTRACT,
        });
        return;
      default:
        setContract({
          RANGEPOOL_ADDRESS: MAINNET_ADDRESS,
          RANGEPOOL_CONTRACT: MIANNET_CONTRACT,
        });
        return;
    }
  }, [chainId]);

  useEffect(() => {
    if (library && !contract.CONTRACT_FEE) {
      getContractFee();
    }
  }, [contract]);

  return contract;
}
