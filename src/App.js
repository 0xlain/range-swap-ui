import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import ConnectWalletButton from "./components/ConnectWalletButton";
import {
  NUM_TOKENS,
  RANGEPOOL_ADDRESS,
  RANGEPOOL_CONTRACT,
} from "./utils/constants";
import TokenSelect from "./components/TokenSelect";
import Token from "./utils/Token";
import { BigNumber } from "@ethersproject/bignumber";

export default function App() {
  return (
    <div
      className="App"
      style={{ maxWidth: "1000px", margin: "auto", padding: "2ch" }}
    >
      <Grid container direction="column">
        <Grid item>
          <Header />
          <Body />
        </Grid>
      </Grid>
    </div>
  );
}

function Header() {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h4">Range Swap</Typography>
      </Grid>
      <Grid item>
        <ConnectWalletButton />
      </Grid>
    </Grid>
  );
}

function Body() {
  const { account, library } = useWeb3React();

  const [tokens, setTokens] = useState([]);

  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [swapButtonText, setSwapButtonText] = useState("Swap");
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [addressFrom, setAddressFrom] = useState();
  const [addressTo, setAddressTo] = useState();
  const [contractFrom, setContractFrom] = useState();
  const [decimalsFrom, setDecimalsFrom] = useState();
  const [enableInfiniteAllowance, setEnableInfiniteAllowance] = useState(false);

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

  useEffect(() => {
    if (!fromToken) return;
    const token = tokens.find((token) => token.symbol === fromToken);
    setContractFrom(token.contract);
    setDecimalsFrom(token.decimals);
    setAddressFrom(token.address);
  }, [fromToken]);

  useEffect(() => {
    if (!toToken) return;
    const addr = tokens.find((token) => token.symbol === toToken).address;
    setAddressTo(addr);
  }, [toToken]);

  useEffect(() => {
    if (!addressFrom || !addressTo || !account) return;

    try {
      RANGEPOOL_CONTRACT.methods
        .amountOut(addressFrom, fromAmount, addressTo)
        .call()
        .then((amount) => {
          setToAmount(amount);
        });
    } catch {}
  }, [addressFrom, addressTo, fromAmount, account]);

  function handleFromAmountChange(e) {
    setFromAmount(e.target.value);
  }

  async function handleApprove() {
    if (!addressFrom || !addressTo || !account) return;
    try {
      const allowance = await contractFrom.methods
        .allowance(RANGEPOOL_ADDRESS, account)
        .call();

      const coeff = BigNumber.from(10).pow(decimalsFrom);

      const infinite = BigNumber.from(999999999999).mul(coeff);
      const needed = BigNumber.from(fromAmount).mul(coeff);

      if (allowance < fromAmount) {
        const allowanceAmount = enableInfiniteAllowance ? infinite : needed;

        await contractFrom.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .send({ from: account });
      }
      return true;
    } catch (e) {
      console.error("error approving");
      return false;
    }
  }

  async function handleSwap() {
    if (!addressFrom || !addressTo || !account) return;

    const success = await handleApprove();
    if (!success) return;

    try {
      RANGEPOOL_CONTRACT.methods
        .swap(addressFrom, fromAmount, addressTo)
        .send({ from: account });
    } catch {}
  }

  function handleCheckboxChange() {
    setEnableInfiniteAllowance(!enableInfiniteAllowance);
  }

  return (
    <Grid container direction="row" spacing={9}>
      <Grid item xs>
        <img
          src="https://pngimg.com/uploads/anime_girl/anime_girl_PNG46.png"
          style={{ width: "100%" }}
        ></img>
      </Grid>
      <Grid
        item
        xs
        container
        direction="column"
        justifyContent="center"
        alignItems="stretch"
        spacing={2}
      >
        <Grid item container spacing={1}>
          <Grid item>
            <TokenSelect label="From" tokens={tokens} onChange={setFromToken} />
          </Grid>
          <Grid item xs>
            <TextField
              label="Amount"
              value={fromAmount}
              onChange={handleFromAmountChange}
              InputProps={{ inputProps: { min: 0 } }}
              type="number"
              style={{ width: "100%" }}
            />
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <ArrowDownwardIcon />
        </Grid>
        <Grid item container spacing={1}>
          <Grid item>
            <TokenSelect label="To" tokens={tokens} onChange={setToToken} />
          </Grid>
          <Grid item xs>
            <TextField
              label=""
              value={toAmount}
              type="number"
              style={{ width: "100%" }}
            />
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <Button
            variant="contained"
            onClick={handleSwap}
            style={{ width: "100%" }}
          >
            {swapButtonText}
          </Button>
        </Grid>
        <Grid item container justifyContent="flex-end" alignItems="center">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  value={enableInfiniteAllowance}
                  onChange={handleCheckboxChange}
                />
              }
              label="infinite allowance"
            />
          </FormGroup>
        </Grid>
      </Grid>
    </Grid>
  );
}
