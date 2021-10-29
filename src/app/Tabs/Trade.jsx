import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from "@mui/material";
import { ReactComponent as SwapTokensIcon } from "../../assets/SwapIcon.svg";

import { RANGEPOOL_ADDRESS, RANGEPOOL_CONTRACT } from "../utils/constants";
import { useTokens } from "../hooks/useTokens";

import TokenSelect from "../components/TokenSelect";

export const Trade = () => {
  const { account } = useWeb3React();

  const tokens = useTokens();

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [addressFrom, setAddressFrom] = useState();
  const [addressTo, setAddressTo] = useState();
  const [contractFrom, setContractFrom] = useState();
  const [decimalsFrom, setDecimalsFrom] = useState();
  const [enableInfiniteAllowance, setEnableInfiniteAllowance] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [disableApproveButton, setDisableApproveButton] = useState(true);
  const [disableSwapButton, setDisableSwapButton] = useState(true);
  const [swapBackground, setSwapBackground] = useState("");
  const [approveBackground, setApproveBackground] = useState("");

  useEffect(() => {
    if (
      account &&
      needsApproval &&
      Number(fromAmount) !== 0 &&
      fromToken &&
      toToken
    ) {
      setDisableApproveButton(false);
      setApproveBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableApproveButton(true);
      setApproveBackground("#59318C59");
    }
  }, [account, needsApproval, fromAmount, fromToken, toToken]);

  useEffect(() => {
    if (
      account &&
      !needsApproval &&
      Number(fromAmount) !== 0 &&
      fromToken &&
      toToken
    ) {
      setDisableSwapButton(false);
      setSwapBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableSwapButton(true);
      setSwapBackground("#59318C59");
    }
  }, [account, needsApproval, fromAmount, fromToken, toToken]);

  useEffect(() => {
    if (!fromToken) return;
    const token = tokens?.find((token) => token.symbol === fromToken);
    setContractFrom(token.contract);
    setDecimalsFrom(token.decimals);
    setAddressFrom(token.address);
  }, [fromToken, tokens]);

  useEffect(() => {
    if (!toToken) return;
    const token = tokens?.find((token) => token.symbol === toToken);
    setAddressTo(token.address);
  }, [toToken, tokens]);

  useEffect(() => {
    (async () => {
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

      const allowance = await contractFrom.methods
        .allowance(RANGEPOOL_ADDRESS, account)
        .call();

      if (allowance < fromAmount) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    })()
  }, [addressFrom, addressTo, fromAmount, account, contractFrom, decimalsFrom]);

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

        const gasLimit = await contractFrom.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .estimateGas({ from: account });

        await contractFrom.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .send({ from: account, gasLimit });
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

      const gasLimit = await RANGEPOOL_CONTRACT.methods
        .swap(addressFrom, needed, addressTo)
        .estimateGas({ from: account });
        
      RANGEPOOL_CONTRACT.methods
        .swap(addressFrom, needed, addressTo)
        .send({ from: account, gasLimit });
    } catch { }
  }

  function handleCheckboxChange() {
    setEnableInfiniteAllowance(!enableInfiniteAllowance);
  }

  function swapTokens() {
    const prevState = {
      fromToken,
      toToken,
    };

    setFromToken(prevState.toToken);
    setToToken(prevState.fromToken);
  }

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
            <TokenSelect
              value={fromToken}
              label="From"
              tokens={tokens}
              onChange={setFromToken}
            />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ background: "#0A0717CC" }}>
            <TextField
              label="Amount"
              value={fromAmount}
              onChange={handleFromAmountChange}
              type="number"
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: <InputAdornment position="end">
                  <Button>Max</Button>
                </InputAdornment>
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid item container justifyContent="flex-start">
        <IconButton onClick={swapTokens}>
          <SwapTokensIcon />
        </IconButton>
      </Grid>
      <Grid item container spacing={1}>
        <Grid item>
          <Paper sx={{ background: "#785FDA33" }}>
            <TokenSelect
              value={toToken}
              label="To"
              tokens={tokens}
              onChange={setToToken}
            />
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
      <Grid item container spacing={1}>
        <Grid item xs>
          <Button
            variant="contained"
            onClick={handleApprove}
            disabled={disableApproveButton}
            sx={{
              width: "100%",
              height: "44px",
              background: approveBackground,
            }}
          >
            Approve
          </Button>
        </Grid>
        <Grid item xs>
          <Button
            variant="contained"
            onClick={handleSwap}
            disabled={disableSwapButton}
            sx={{
              width: "100%",
              height: "44px",
              background: swapBackground,
            }}
          >
            Swap
          </Button>
        </Grid>
      </Grid>
      <Grid item container justifyContent="flex-start" alignItems="center">
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
