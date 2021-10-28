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
  Typography,
} from "@mui/material";

import TokenSelect from "../components/TokenSelect";
import { useTokens } from "../hooks/useTokens";
import { RANGEPOOL_ADDRESS, RANGEPOOL_CONTRACT } from "../utils/constants";

export const LP = () => {
  const { account } = useWeb3React();
  const tokens = useTokens();

  const [selectedMode, setSelectedMode] = useState("Add");
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [disableApproveButton, setDisableApproveButton] = useState(true);
  const [disableSwapButton, setDisableSwapButton] = useState(true);
  const [disableWithdrawButton, setDisableWithdrawButton] = useState(true);
  const [approveBackground, setApproveBackground] = useState();
  const [swapBackground, setSwapBackground] = useState();
  const [withdrawBackground, setWithdrawBackground] = useState();
  const [tokenContract, setTokenContract] = useState();
  const [tokenDecimals, setTokenDecimals] = useState();
  const [tokenAddress, setTokenAddress] = useState();
  const [enableInfiniteAllowance, setEnableInfiniteAllowance] = useState(false);

  useEffect(() => {
    if (account && needsApproval && Number(amount) !== 0 && token) {
      setDisableApproveButton(false);
      setApproveBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableApproveButton(true);
      setApproveBackground("#59318C59");
    }
  }, [account, needsApproval, amount, token]);

  useEffect(() => {
    if (account && !needsApproval && Number(amount) !== 0 && token) {
      setDisableSwapButton(false);
      setSwapBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableSwapButton(true);
      setSwapBackground("#59318C59");
    }
  }, [account, needsApproval, amount, token]);

  useEffect(() => {
    if (account && Number(amount) !== 0 && token) {
      setDisableWithdrawButton(false);
      setWithdrawBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableWithdrawButton(true);
      setWithdrawBackground("#59318C59");
    }
  }, [account, needsApproval, amount, token]);

  useEffect(() => {
    if (!token) return;
    const newToken = tokens?.find((item) => item.symbol === token);
    setTokenContract(newToken.contract);
    setTokenDecimals(newToken.decimals);
    setTokenAddress(newToken.address);
  }, [token, tokens]);

  useEffect(async () => {
    if (!tokenAddress) return;

    if (selectedMode === "Add") {
      const coeff = BigNumber.from(10).pow(tokenDecimals);
      const maxAdd = BigNumber.from(
        await RANGEPOOL_CONTRACT.methods.maxCanAdd(tokenAddress).call()
      ).div(coeff);

      if (amount > maxAdd.toNumber()) {
        setAmount(maxAdd);
      }
    }
  }, [amount, tokenAddress, selectedMode]);

  useEffect(async () => {
    if (!tokenContract || !account) return;

    const allowance = await tokenContract.methods
      .allowance(RANGEPOOL_ADDRESS, account)
      .call();

    if (allowance < amount) {
      setNeedsApproval(true);
    } else {
      setNeedsApproval(false);
    }
  }, [account, tokenContract, amount]);

  async function handleApprove() {
    if (!tokenAddress || !account) return;
    try {
      const allowance = await tokenContract.methods
        .allowance(RANGEPOOL_ADDRESS, account)
        .call();

      const coeff = BigNumber.from(10).pow(tokenDecimals);
      const infinite = BigNumber.from(999999999999).mul(coeff);
      const needed = BigNumber.from(amount).mul(coeff);

      if (allowance < amount) {
        const allowanceAmount = enableInfiniteAllowance ? infinite : needed;

        await tokenContract.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .send({ from: account });
      }
      return true;
    } catch (e) {
      console.error("error approving");
      return false;
    }
  }

  async function handleAdd() {
    if (!tokenAddress || !amount || !account) return;

    const success = await handleApprove();
    if (!success) return;

    const coeff = BigNumber.from(10).pow(tokenDecimals);
    const needed = BigNumber.from(amount).mul(coeff);

    try {
      RANGEPOOL_CONTRACT.methods
        .add(tokenAddress, needed)
        .send({ from: account });
    } catch {}
  }

  async function handleWithdraw() {
    if (!tokenAddress || !amount || !account) return;

    //TODO: get number of tokens available to withdraw

    const coeff = BigNumber.from(10).pow(tokenDecimals);
    const needed = BigNumber.from(amount).mul(coeff);

    try {
      RANGEPOOL_CONTRACT.methods
        .remove(tokenAddress, needed)
        .send({ from: account });
    } catch {}
  }

  function handleAmountChange(e) {
    setAmount(e.target.value);
  }

  function handleAddTabClick() {
    setSelectedMode("Add");
  }

  function handleWithdrawTabClick() {
    setSelectedMode("Withdraw");
  }

  function handleCheckboxChange() {
    setEnableInfiniteAllowance(!enableInfiniteAllowance);
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
        <Grid item xs>
          <Button
            sx={{
              width: "100%",
              height: "44px",
              background: selectedMode === "Add" ? "#0A0717CC" : "#896BFE26",
            }}
            variant="contained"
            onClick={handleAddTabClick}
          >
            Add
          </Button>
        </Grid>
        <Grid item xs>
          <Button
            sx={{
              width: "100%",
              height: "44px",
              background:
                selectedMode === "Withdraw" ? "#0A0717CC" : "#896BFE26",
            }}
            variant="contained"
            onClick={handleWithdrawTabClick}
          >
            Withdraw
          </Button>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="body1">{selectedMode}</Typography>
      </Grid>
      <Grid item container spacing={1}>
        <Grid item xs>
          <Paper sx={{ background: "#785FDA33" }}>
            <TokenSelect tokens={tokens} onChange={setToken} />
          </Paper>
        </Grid>
        <Grid item>
          <Paper sx={{ background: "#0A0717CC" }}>
            <TextField
              label="Amount"
              value={amount}
              onChange={handleAmountChange}
              InputProps={{ inputProps: { min: 0 } }}
              type="number"
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid item container spacing={1}>
        {selectedMode === "Add" ? (
          <>
            <Grid item xs>
              <Button
                variant="contained"
                disabled={disableApproveButton}
                onClick={handleApprove}
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
                disabled={disableSwapButton}
                onClick={handleAdd}
                sx={{
                  width: "100%",
                  height: "44px",
                  background: swapBackground,
                }}
              >
                Swap
              </Button>
            </Grid>
          </>
        ) : (
          <Grid item xs>
            <Button
              variant="contained"
              disabled={disableWithdrawButton}
              onClick={handleWithdraw}
              sx={{
                width: "100%",
                height: "44px",
                background: withdrawBackground,
              }}
            >
              Withdraw
            </Button>
          </Grid>
        )}
        {selectedMode === "Add" ? (
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
        ) : null}
      </Grid>
    </Grid>
  );
};
