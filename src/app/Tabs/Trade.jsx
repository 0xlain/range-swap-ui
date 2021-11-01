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
  font-size: 9px;
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
  const { RANGEPOOL_ADDRESS, RANGEPOOL_CONTRACT } = useRangepool();
  const tokens = useTokens();

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState(BigNumber.from(0));
  const [toAmount, setToAmount] = useState(BigNumber.from(0));
  const [fromFieldAmount, setFromFieldAmount] = useState(0);
  const [toFieldAmount, setToFieldAmount] = useState(0);
  const [addressFrom, setAddressFrom] = useState();
  const [addressTo, setAddressTo] = useState();
  const [contractFrom, setContractFrom] = useState();
  const [decimalsFrom, setDecimalsFrom] = useState(18);
  const [decimalsTo, setDecimalsTo] = useState(18);
  const [enableInfiniteAllowance, setEnableInfiniteAllowance] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [disableApproveButton, setDisableApproveButton] = useState(true);
  const [disableSwapButton, setDisableSwapButton] = useState(true);
  const [swapBackground, setSwapBackground] = useState("");
  const [approveBackground, setApproveBackground] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (account && contractFrom) {
      getUserBalance();
    }
  }, [account, contractFrom]);

  useEffect(() => {
    if (
      account &&
      needsApproval &&
      Number(fromAmount) !== 0 &&
      fromFieldAmount !== 0 &&
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
  }, [account, needsApproval, fromAmount, fromFieldAmount, fromToken, toToken]);

  useEffect(() => {
    if (
      account &&
      !needsApproval &&
      Number(fromAmount) !== 0 &&
      fromFieldAmount !== 0 &&
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
  }, [account, needsApproval, fromAmount, fromFieldAmount, fromToken, toToken]);

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
    setDecimalsTo(token.decimals);
  }, [toToken, tokens]);

  useEffect(() => {
    (async () => {
      if (!addressFrom || !addressTo || !account) return;

      const maxTo = BigNumber.from(
        await RANGEPOOL_CONTRACT.methods
          .maxCanSwap(addressFrom, addressTo)
          .call()
      );

      const amountOut = BigNumber.from(
        await RANGEPOOL_CONTRACT.methods
          .amountOut(addressFrom, fromAmount, addressTo)
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
        await contractFrom.methods.allowance(account, RANGEPOOL_ADDRESS).call()
      );

      if (allowance.lt(fromAmount)) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    })();
  }, [addressFrom, addressTo, fromAmount, account, contractFrom, decimalsFrom]);

  function handleFromAmountChange(e) {
    const int = BigNumber.from(Math.floor(e.target.value)).mul(
      BigNumber.from(10).pow(decimalsFrom)
    );

    const decimals = BigNumber.from(
      Math.floor((e.target.value % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(decimalsFrom - ROUNDING_DECIMALS));

    const newAmount = int.add(decimals);

    setFromAmount(newAmount);
    setFromFieldAmount(e.target.value);
  }

  useEffect(() => {
    if (!fromAmount) return;

    const int = BigNumber.from(Math.floor(fromFieldAmount)).mul(
      BigNumber.from(10).pow(decimalsFrom)
    );

    const decimals = BigNumber.from(
      Math.floor((fromFieldAmount % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(decimalsFrom - ROUNDING_DECIMALS));

    const simulated = int.add(decimals);

    if (!fromAmount.eq(simulated)) {
      const newFieldAmount =
        fromAmount
          .div(BigNumber.from(10).pow(decimalsFrom - ROUNDING_DECIMALS))
          .toNumber() /
        10 ** ROUNDING_DECIMALS;

      setFromFieldAmount(newFieldAmount);
    }
  }, [fromAmount]);

  useEffect(() => {
    const int = BigNumber.from(Math.floor(toFieldAmount)).mul(
      BigNumber.from(10).pow(decimalsTo)
    );

    const decimals = BigNumber.from(
      Math.floor((toFieldAmount % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(decimalsTo - ROUNDING_DECIMALS));

    const simulated = int.add(decimals);

    if (!toAmount.eq(simulated)) {
      const newFieldAmount =
        toAmount
          .div(BigNumber.from(10).pow(decimalsTo - ROUNDING_DECIMALS))
          .toNumber() /
        10 ** ROUNDING_DECIMALS;

      setToFieldAmount(newFieldAmount);
    }
  }, [toAmount]);

  async function getUserBalance() {
    const userBalance = BigNumber.from(
      await contractFrom.methods.balanceOf(account).call()
    );

    const formattedBalance = formatUserBalance(userBalance);
    setBalance(formattedBalance);
  }

  async function handleApprove() {
    if (!addressFrom || !addressTo || !account) return;
    try {
      const infinite = BigNumber.from(999999999999).mul(
        BigNumber.from(10).pow(decimalsFrom)
      );

      if (needsApproval) {
        const allowanceAmount = enableInfiniteAllowance ? infinite : fromAmount;

        const gasLimit = await contractFrom.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .estimateGas({ from: account });

        await contractFrom.methods
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
    if (!addressFrom || !addressTo || !account) return;

    const success = await handleApprove();
    if (!success) return;

    try {
      const gasLimit = await RANGEPOOL_CONTRACT.methods
        .swap(addressFrom, fromAmount, addressTo)
        .estimateGas({ from: account });

      RANGEPOOL_CONTRACT.methods
        .swap(addressFrom, fromAmount, addressTo)
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
      fromToken,
      toToken,
    };

    setFromToken(prevState.toToken);
    setToToken(prevState.fromToken);
  }

  async function handleMaxFrom() {
    try {
      const bal = BigNumber.from(
        await contractFrom.methods.balanceOf(account).call()
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
              value={fromFieldAmount}
              onChange={handleFromAmountChange}
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: (
                  <InputAdornment position="end">
                    <MaxButtonWrapper>
                      {Boolean(balance) && <BalanceText>{balance}</BalanceText>}
                      <Button onClick={handleMaxFrom}>Max</Button>
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
              value={toFieldAmount}
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
