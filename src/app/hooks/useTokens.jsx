import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { NUM_TOKENS, RANGEPOOL_CONTRACT } from "../utils/constants";
import Token from "../utils/Token";

export function useTokens() {
  const { library } = useWeb3React();

  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (!library) return;

    RANGEPOOL_CONTRACT.setProvider(library.currentProvider);

    const promises = [];
    for (let i = 0; i < NUM_TOKENS; i++) {
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            const address = await RANGEPOOL_CONTRACT.methods.tokens(i).call();
            const token = new Token(address, library.currentProvider);
            await token.getSymbol();
            if (token.symbol === "USDC" || token.symbol === "USDT") resolve();
            await token.getDecimals();
            resolve(token);
          } catch {
            resolve();
          }
        })
      );
    }

    Promise.all(promises).then((addresses) => {
      const newTokens = addresses.filter((address) => address !== undefined);

      setTokens(newTokens);
    });
  }, [library]);

  return tokens;
}
