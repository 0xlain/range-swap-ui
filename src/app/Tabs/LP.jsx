import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import styled from "@emotion/styled";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";

import TokenSelect from "../components/TokenSelect";
import { useTokens } from "../hooks/useTokens";
import { RANGEPOOL_ADDRESS, RANGEPOOL_CONTRACT } from "../utils/constants";

const TabButton = styled(Button)`
  width: 100%;
  height: 44px;
  background: ${({ isSelected }) => (isSelected ? "#896BFE26" : "#0A0717CC")};
  color: ${({ isSelected }) => (isSelected ? "#FFFFFF" : "#896BFEB0")};
  background-clip: padding-box, border-box;
  border: ${({ isSelected }) =>
    isSelected ? "solid 1px transparent" : "none"};
  border-radius: 5 px;
  background-origin: border-box;
  background-image: ${({ isSelected }) =>
    isSelected
      ? `
        linear-gradient(rgba(36, 28, 66, 0.993), rgba(36, 28, 66, 0.993)),
        linear-gradient(180deg, #876cf4 0%, #ff6d41 100%)`
      : "none"};
`;

const MODES = {
  ADD: "Add",
  WITHDRAW: "Withdraw",
};

export const LP = () => {
  const { account } = useWeb3React();
  const tokens = useTokens();

  const [selectedMode, setSelectedMode] = useState(MODES.ADD);
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
    if (!newToken) return;
    setTokenContract(newToken.contract);
    setTokenDecimals(newToken.decimals);
    setTokenAddress(newToken.address);
  }, [token, tokens]);

  useEffect(() => {
    (async () => {
      if (!tokenAddress) return;

      if (selectedMode === "Add") {
        const coeff = BigNumber.from(10).pow(tokenDecimals);
        const maxAdd = BigNumber.from(
          await RANGEPOOL_CONTRACT.methods.maxCanAdd(tokenAddress).call()
        ).div(coeff);

        if (amount > maxAdd.toNumber()) {
          setAmount(maxAdd);
        }
      } else if (selectedMode === "Withdraw") {
        const poolDecimals = await RANGEPOOL_CONTRACT.methods.decimals().call();
        const coeff = BigNumber.from(10).pow(poolDecimals);
        const balance = BigNumber.from(
          await RANGEPOOL_CONTRACT.methods.balanceOf(account).call()
        ).div(coeff);

        if (amount > balance.toNumber()) {
          setAmount(balance);
        }
      }
    })();
  }, [amount, tokenAddress, selectedMode, tokenDecimals, account]);

  useEffect(() => {
    (async () => {
      if (!tokenContract || !account) return;

      const allowance = await tokenContract.methods
        .allowance(RANGEPOOL_ADDRESS, account)
        .call();

      if (allowance < amount) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    })();
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

        const gasLimit = await tokenContract.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .estimateGas({ from: account });

        await tokenContract.methods
          .approve(RANGEPOOL_ADDRESS, allowanceAmount)
          .send({ from: account, gasLimit });
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
      const gasLimit = await RANGEPOOL_CONTRACT.methods
        .add(tokenAddress, needed)
        .estimateGas({ from: account });
      RANGEPOOL_CONTRACT.methods
        .add(tokenAddress, needed)
        .send({ from: account, gasLimit });
    } catch {}
  }

  async function handleWithdraw() {
    if (!tokenAddress || !amount || !account) return;

    const coeff = BigNumber.from(10).pow(tokenDecimals);
    const needed = BigNumber.from(amount).mul(coeff);

    try {
      const gasLimit = await RANGEPOOL_CONTRACT.methods
        .remove(tokenAddress, needed)
        .estimateGas({ from: account });
      RANGEPOOL_CONTRACT.methods
        .remove(tokenAddress, needed)
        .send({ from: account, gasLimit });
    } catch {}
  }

  function handleAmountChange(e) {
    setAmount(e.target.value);
  }

  function handleAddTabClick() {
    setAmount(0);
    setSelectedMode(MODES.ADD);
  }

  function handleWithdrawTabClick() {
    setSelectedMode(MODES.WITHDRAW);
  }

  function handleCheckboxChange() {
    setEnableInfiniteAllowance(!enableInfiniteAllowance);
  }

  async function handleMaxWithdraw() {
    const currentToken = tokens.find((item) => item.symbol === token);
    const { contract, address } = currentToken;

    const balance = Number(await contract.methods.balanceOf(account).call());
    if (!balance) {
      return;
    }

    const maxCanRemove = await RANGEPOOL_CONTRACT.methods
      .maxCanRemove(address)
      .call();

    if (maxCanRemove > balance) {
      setAmount(balance);
    } else {
      setAmount(maxCanRemove);
    }
  }

  async function handleMaxAdd() {
    const currentToken = tokens.find((item) => item.symbol === token);
    const { contract, address } = currentToken;

    const balance = Number(await contract.methods.balanceOf(account).call());
    if (!balance) {
      return;
    }

    const maxCanAdd = await RANGEPOOL_CONTRACT.methods
      .maxCanAdd(address)
      .call();

    if (maxCanAdd > balance) {
      setAmount(balance);
    } else {
      setAmount(maxCanAdd);
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
        <Grid item xs>
          <TabButton
            variant="contained"
            isSelected={selectedMode === MODES.ADD}
            onClick={handleAddTabClick}
          >
            Add
          </TabButton>
        </Grid>
        <Grid item xs>
          <TabButton
            isSelected={selectedMode === MODES.WITHDRAW}
            variant="contained"
            onClick={handleWithdrawTabClick}
          >
            Withdraw
          </TabButton>
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
              InputProps={{
                inputProps: { min: 0 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={
                        selectedMode === "Withdraw"
                          ? handleMaxWithdraw
                          : handleMaxAdd
                      }
                    >
                      Max
                    </Button>
                  </InputAdornment>
                ),
              }}
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
