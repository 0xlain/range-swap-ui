import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  TextField,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import {
  NUM_TOKENS,
  RANGEPOOL_ADDRESS,
  RANGEPOOL_CONTRACT,
} from "../../utils/constants";
import Token from "../../utils/Token";
import TokenSelect from "../../components/TokenSelect";
import ConnectWalletButton from "../../components/ConnectWalletButton";

export const Trade = () => {
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
  const [decimalsTo, setDecimalsTo] = useState();
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
    const token = tokens.find((token) => token.symbol === toToken);
    setDecimalsTo(token.decimals);
    setAddressTo(token.address);
  }, [toToken]);

  useEffect(async () => {
    if (!addressFrom || !addressTo || !account) return;

    const coeff = BigNumber.from(10).pow(decimalsFrom);

    const maxTo = BigNumber.from(
      await RANGEPOOL_CONTRACT.methods.maxCanSwap(addressFrom, addressTo).call()
    ).div(coeff);

    const maxFrom = BigNumber.from(
      await RANGEPOOL_CONTRACT.methods.maxCanSwap(addressTo, addressFrom).call()
    ).div(coeff);

    const amountOut = BigNumber.from(
      await RANGEPOOL_CONTRACT.methods
        .amountOut(addressFrom, fromAmount, addressTo)
        .call()
    );

    if (amountOut.lte(maxTo)) {
      setToAmount(amountOut);
    } else {
      setToAmount(maxTo.toNumber());
      setFromAmount(maxFrom.toNumber());
    }
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

    const coeff = BigNumber.from(10).pow(decimalsFrom);
    const needed = BigNumber.from(fromAmount).mul(coeff);

    try {
      RANGEPOOL_CONTRACT.methods
        .swap(addressFrom, needed, addressTo)
        .send({ from: account });
    } catch {}
  }

  function handleCheckboxChange() {
    setEnableInfiniteAllowance(!enableInfiniteAllowance);
  }

  const swapBg = account
    ? "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
    : " #59318C59  ";

  const connectBg = !account
    ? "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
    : " #59318C59  ";

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="stretch"
      spacing={2}
    >
      <Grid item container spacing={1}>
        <Grid item>
          <Paper sx={{ background: "#785FDA33" }}>
            <TokenSelect label="From" tokens={tokens} onChange={setFromToken} />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ background: "#0A0717CC" }}>
            <TextField
              label="Amount"
              value={fromAmount}
              onChange={handleFromAmountChange}
              InputProps={{ inputProps: { min: 0 } }}
              type="number"
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid item container justifyContent="flex-start">
        <ArrowDownwardIcon />
      </Grid>
      <Grid item container spacing={1}>
        <Grid item>
          <Paper sx={{ background: "#785FDA33" }}>
            <TokenSelect label="To" tokens={tokens} onChange={setToToken} />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ background: "#0A0717CC" }}>
            <TextField
              label=""
              value={toAmount}
              type="number"
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid item container justifyContent="center">
        <Button
          variant="contained"
          onClick={handleSwap}
          disabled={!account}
          sx={{
            width: "100%",
            background: swapBg,
          }}
        >
          {swapButtonText}
        </Button>
      </Grid>
      <Grid item container justifyContent="center">
        <ConnectWalletButton buttonBackground={connectBg} />
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
  );
};
