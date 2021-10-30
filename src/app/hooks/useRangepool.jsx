import { useWeb3React } from "@web3-react/core";
import {
  MAINNET_ADDRESS,
  MIANNET_CONTRACT,
  ROPSTEN_ADDRESS,
  ROPSTEN_CONTRACT,
} from "../utils/constants";

export function useRangepool() {
  const { chainId } = useWeb3React();

  switch (chainId) {
    case 3:
      return {
        RANGEPOOL_ADDRESS: ROPSTEN_ADDRESS,
        RANGEPOOL_CONTRACT: ROPSTEN_CONTRACT,
      };
    default:
      return {
        RANGEPOOL_ADDRESS: MAINNET_ADDRESS,
        RANGEPOOL_CONTRACT: MIANNET_CONTRACT,
      };
  }
}
