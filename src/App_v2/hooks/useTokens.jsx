import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { NUM_TOKENS, RANGEPOOL_CONTRACT } from "../utils/constants";
import Token from "../utils/Token";

export function useTokens() {
  const { account, library } = useWeb3React();

  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (!library) return;
    RANGEPOOL_CONTRACT.defaultAccount = account;
    RANGEPOOL_CONTRACT.setProvider(library.currentProvider);

    const promises = [];
    for (var i = 0; i < NUM_TOKENS; i++) {
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            const address = await RANGEPOOL_CONTRACT.methods.tokens(i).call();
            const token = new Token(address, library.currentProvider);
            await token.getSymbol();
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
  }, [account]);

  return tokens;
}
