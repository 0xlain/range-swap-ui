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
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { ReactComponent as SwapTokensIcon } from "../../assets/SwapIcon.svg";

import { useTokens } from "../hooks/useTokens";
import { useRangepool } from "../hooks/useRangepool";
import TokenSelect from "../components/TokenSelect";
import { ROUNDING_DECIMALS } from "../utils/constants";
import { formatUserBalance } from "../utils";

const BalanceText = styled.p`
  margin: 0;
  font-family: DM Mono;
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 100%;
  color: rgba(137, 107, 254, 0.7);
`;

const MaxButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
`;

export const Trade = () => {
  const { account } = useWeb3React();
  const { RANGEPOOL_ADDRESS, RANGEPOOL_CONTRACT, CONTRACT_FEE } =
    useRangepool();
  const tokens = useTokens();

  const [fromTokenName, setFromTokenName] = useState("");
  const [toTokenName, setToTokenName] = useState("");
  const [tokenFrom, setTokenFrom] = useState();
  const [tokenTo, setTokenTo] = useState();
  const [fromAmount, setFromAmount] = useState(BigNumber.from(0));
  const [fee, setFee] = useState(0);
  const [toAmount, setToAmount] = useState(BigNumber.from(0));
  const [fromFieldAmount, setFromFieldAmount] = useState(0);
  const [toFieldAmount, setToFieldAmount] = useState(0);
  const [enableInfiniteAllowance, setEnableInfiniteAllowance] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [disableApproveButton, setDisableApproveButton] = useState(true);
  const [disableSwapButton, setDisableSwapButton] = useState(true);
  const [swapBackground, setSwapBackground] = useState("");
  const [approveBackground, setApproveBackground] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (account && tokenFrom) {
      getUserBalance();
    }
  }, [account, tokenFrom]);

  useEffect(() => {
    if (
      account &&
      needsApproval &&
      Number(fromAmount) !== 0 &&
      fromFieldAmount !== 0 &&
      fromTokenName &&
      toTokenName
    ) {
      setDisableApproveButton(false);
      setApproveBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableApproveButton(true);
      setApproveBackground("#59318C59");
    }
  }, [
    account,
    needsApproval,
    fromAmount,
    fromFieldAmount,
    fromTokenName,
    toTokenName,
  ]);

  useEffect(() => {
    if (
      account &&
      !needsApproval &&
      Number(fromAmount) !== 0 &&
      fromFieldAmount !== 0 &&
      fromTokenName &&
      toTokenName
    ) {
      setDisableSwapButton(false);
      setSwapBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableSwapButton(true);
      setSwapBackground("#59318C59");
    }
  }, [
    account,
    needsApproval,
    fromAmount,
    fromFieldAmount,
    fromTokenName,
    toTokenName,
  ]);

  useEffect(() => {
    if (!fromTokenName) return;
    const token = tokens?.find((token) => token.symbol === fromTokenName);
    setTokenFrom(token);
  }, [fromTokenName, tokens]);

  useEffect(() => {
    if (!toTokenName) return;
    const token = tokens?.find((token) => token.symbol === toTokenName);
    setTokenTo(token);
  }, [toTokenName, tokens]);

  useEffect(() => {
    (async () => {
      if (!tokenFrom || !tokenTo || !account) return;

      const maxTo = BigNumber.from(
        await RANGEPOOL_CONTRACT.methods
          .maxCanSwap(tokenFrom.address, tokenTo.address)
          .call()
      );

      const amountOut = BigNumber.from(
        await RANGEPOOL_CONTRACT.methods
          .amountOut(tokenFrom.address, fromAmount, tokenTo.address)
          .call()
      );

      if (
        amountOut.gt(maxTo) ||
        (amountOut.eq(BigNumber.from(0)) && !fromAmount.eq(BigNumber.from(0)))
      ) {
        setToAmount(maxTo);
        //idk if this is the correct way to set the from amount,
        //we want to cap it once the maxTo amount is reached
        setFromAmount(maxTo);
      } else {
        setToAmount(amountOut);
      }

      const allowance = BigNumber.from(
        await tokenFrom.contract.methods
          .allowance(account, RANGEPOOL_ADDRESS)
          .call()
      );

      if (allowance.lt(fromAmount)) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    })();
  }, [tokenFrom, tokenTo, fromAmount, account, tokenFrom, tokenFrom]);

  useEffect(() => {
    if (CONTRACT_FEE) {
      const feeMultiplier = CONTRACT_FEE / 10 ** 9;

      const feePercent = feeMultiplier * 100;
      setFee(feePercent);
    }
  }, [CONTRACT_FEE]);

  function handleFromAmountChange(e) {
    const int = BigNumber.from(Math.floor(e.target.value)).mul(
      BigNumber.from(10).pow(tokenFrom.decimals)
    );

    const decimals = BigNumber.from(
      Math.floor((e.target.value % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(tokenFrom.decimals - ROUNDING_DECIMALS));

    const newAmount = int.add(decimals);

    setFromAmount(newAmount);
    setFromFieldAmount(e.target.value);
  }

  useEffect(() => {
    if (!tokenFrom) return;

    const int = BigNumber.from(Math.floor(fromFieldAmount)).mul(
      BigNumber.from(10).pow(tokenFrom.decimals)
    );

    const decimals = BigNumber.from(
      Math.floor((fromFieldAmount % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(tokenFrom.decimals - ROUNDING_DECIMALS));

    const simulated = int.add(decimals);

    if (!fromAmount.eq(simulated)) {
      const newFieldAmount =
        fromAmount
          .div(BigNumber.from(10).pow(tokenFrom.decimals - ROUNDING_DECIMALS))
          .toNumber() /
        10 ** ROUNDING_DECIMALS;

      setFromFieldAmount(newFieldAmount);
    }
  }, [fromAmount, tokenFrom]);

  useEffect(() => {
    if (!tokenTo) return;

    const int = BigNumber.from(Math.floor(toFieldAmount)).mul(
      BigNumber.from(10).pow(tokenTo.decimals)
    );

    const decimals = BigNumber.from(
      Math.floor((toFieldAmount % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(tokenTo.decimals - ROUNDING_DECIMALS));

    const simulated = int.add(decimals);

    if (!toAmount.eq(simulated)) {
      const newFieldAmount =
        toAmount
          .div(BigNumber.from(10).pow(tokenTo.decimals - ROUNDING_DECIMALS))
          .toNumber() /
        10 ** ROUNDING_DECIMALS;

      setToFieldAmount(newFieldAmount);
    }
  }, [toAmount, tokenTo]);

  async function getUserBalance() {
    const userBalance = BigNumber.from(
      await tokenFrom.contract.methods.balanceOf(account).call()
    );

    const formattedBalance = formatUserBalance(userBalance);
    setBalance(formattedBalance);
  }

  async function handleApprove() {
    if (!tokenFrom || !tokenTo || !account) return;
    try {
      const infinite = BigNumber.from(999999999999).mul(
        BigNumber.from(10).pow(tokenFrom.decimals)
      );

      if (needsApproval) {
        const allowanceAmount = enableInfiniteAllowance ? infinite : fromAmount;

        const gasLimit = await tokenFrom.contract.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .estimateGas({ from: account });

        await tokenFrom.contract.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .send({ from: account, gasLimit });

        setNeedsApproval(false);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function handleSwap() {
    if (!tokenFrom || !tokenTo || !account) return;

    const success = await handleApprove();
    if (!success) return;

    try {
      const gasLimit = await RANGEPOOL_CONTRACT.methods
        .swap(tokenFrom.address, fromAmount, tokenTo.address)
        .estimateGas({ from: account });

      RANGEPOOL_CONTRACT.methods
        .swap(tokenFrom.address, fromAmount, tokenTo.address)
        .send({ from: account, gasLimit });
    } catch (e) {
      console.error(e);
    }
  }

  function handleCheckboxChange() {
    setEnableInfiniteAllowance(!enableInfiniteAllowance);
  }

  function swapTokens() {
    const prevState = {
      fromToken: fromTokenName,
      toToken: toTokenName,
    };

    setFromTokenName(prevState.toToken);
    setToTokenName(prevState.fromToken);
  }

  async function handleMaxFrom() {
    try {
      const bal = BigNumber.from(
        await tokenFrom.contract.methods.balanceOf(account).call()
      );

      setFromAmount(bal);
    } catch (e) {
      console.error(e);
    }
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
              value={fromTokenName}
              label="From"
              tokens={tokens}
              onChange={setFromTokenName}
            />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ background: "#0A0717CC" }}>
            <TextField
              label="Amount"
              value={fromFieldAmount}
              onChange={handleFromAmountChange}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: (
                  <InputAdornment position="end">
                    <MaxButtonWrapper>
                      <Button onClick={handleMaxFrom}>
                        <BalanceText>Balance: {balance || 0}</BalanceText>
                      </Button>
                    </MaxButtonWrapper>
                  </InputAdornment>
                ),
              }}
              type="number"
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
              value={toTokenName}
              label="To"
              tokens={tokens}
              onChange={setToTokenName}
            />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ background: "#0A0717CC" }}>
            <TextField
              label=""
              value={toFieldAmount}
              type="number"
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container item justifyContent="space-between">
        <Grid item>
          <Typography>Fee:</Typography>
        </Grid>
        <Grid item>
          <Typography>{fee} %</Typography>
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
            label="Infinite allowance"
          />
        </FormGroup>
      </Grid>
    </Grid>
  );
};
