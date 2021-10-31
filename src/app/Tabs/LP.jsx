import { useEffect, useRef, useState } from "react";
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
import { useRangepool } from "../hooks/useRangepool";
import { ROUNDING_DECIMALS } from "../utils/constants";
import { formatNumber } from "../utils";

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

const Text = styled.p`
  font-family: DM Mono;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  margin: 0;
  text-align: center;
`;

const UserLiquidityBalance = styled(Text)`
  background: linear-gradient(180deg, #785fda 0%, #ff6d41 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 16px;
`;

const UserLiquidityHeader = styled(Text)`
  color: rgba(250, 250, 250, 0.75);
  text-transform: uppercase;
  font-size: 10px;
  margin-top: 8px;
`;

const MODES = {
  ADD: "Add",
  WITHDRAW: "Withdraw",
};

export const LP = () => {
  const { account } = useWeb3React();
  const tokens = useTokens();
  const { RANGEPOOL_ADDRESS, RANGEPOOL_CONTRACT } = useRangepool();

  const [currentPosition, setCurrentPosition] = useState(0);
  const [selectedMode, setSelectedMode] = useState(MODES.ADD);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState(BigNumber.from(0));
  const [fieldAmount, setFieldAmount] = useState(BigNumber.from(0));
  const [needsApproval, setNeedsApproval] = useState(false);
  const [disableApproveButton, setDisableApproveButton] = useState(true);
  const [disableSwapButton, setDisableSwapButton] = useState(true);
  const [disableWithdrawButton, setDisableWithdrawButton] = useState(true);
  const [approveBackground, setApproveBackground] = useState();
  const [swapBackground, setSwapBackground] = useState();
  const [withdrawBackground, setWithdrawBackground] = useState();
  const [tokenContract, setTokenContract] = useState();
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [tokenAddress, setTokenAddress] = useState();
  const [tokenMaxAdd, setTokenMaxAdd] = useState(BigNumber.from(0));
  const [enableInfiniteAllowance, setEnableInfiniteAllowance] = useState(false);

  const getUserBalance = async () => {
    const poolCoeff = BigNumber.from(10).pow(tokenDecimals);
    const balance = BigNumber.from(
      await RANGEPOOL_CONTRACT.methods.balanceOf(account).call()
    );

    const balanceDecimals = balance
      .mod(poolCoeff)
      .div(BigNumber.from(10).pow(tokenDecimals - ROUNDING_DECIMALS))
      .toNumber();
    const balanceInteger = balance.div(poolCoeff).toNumber();

    const userBalance = Number(`${balanceInteger}.${balanceDecimals}`);

    setCurrentPosition(userBalance);
  };

  useEffect(() => {
    if (account) {
      getUserBalance();
    }
  }, [account, tokenDecimals]);

  useEffect(() => {
    if (
      account &&
      needsApproval &&
      !amount.eq(BigNumber.from(0)) &&
      fieldAmount !== 0 &&
      token
    ) {
      setDisableApproveButton(false);
      setApproveBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableApproveButton(true);
      setApproveBackground("#59318C59");
    }
  }, [account, needsApproval, amount, fieldAmount, token]);

  useEffect(() => {
    if (
      account &&
      !needsApproval &&
      !amount.eq(BigNumber.from(0)) !== 0 &&
      fieldAmount !== 0 &&
      token
    ) {
      setDisableSwapButton(false);
      setSwapBackground(
        "linear-gradient(180deg, rgba(43, 22, 129, 0) 0%, #2B1681 100%),linear-gradient(0deg, #59318C, #59318C)"
      );
    } else {
      setDisableSwapButton(true);
      setSwapBackground("#59318C59");
    }
  }, [account, needsApproval, amount, fieldAmount, token]);

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
    setTokenMaxAdd(newToken.maxAdd);
  }, [token, tokens]);

  useEffect(() => {
    (async () => {
      if (!tokenAddress) return;

      if (selectedMode === "Add") {
        if (amount.gt(tokenMaxAdd)) {
          setAmount(tokenMaxAdd);
        }
      } else if (selectedMode === "Withdraw") {
        const balance = BigNumber.from(
          await RANGEPOOL_CONTRACT.methods.balanceOf(account).call()
        );
        if (amount.gt(balance)) {
          setAmount(balance);
        }

        const maxRemove = BigNumber.from(
          await RANGEPOOL_CONTRACT.methods.maxCanRemove(tokenAddress).call()
        );
        if (amount.gt(maxRemove)) {
          setAmount(maxRemove);
        }
      }
    })();
  }, [amount, tokenAddress, selectedMode, tokenDecimals, account]);

  useEffect(() => {
    (async () => {
      if (!tokenContract || !account) return;

      const allowance = BigNumber.from(
        await tokenContract.methods.allowance(account, RANGEPOOL_ADDRESS).call()
      );

      if (allowance.lt(amount)) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    })();
  }, [account, tokenContract, amount]);

  async function handleApprove() {
    if (!tokenAddress || !account) return;
    if (!needsApproval) return true;
    try {
      const coeff = BigNumber.from(10).pow(tokenDecimals);
      const infinite = BigNumber.from(999999999999).mul(coeff);

      const allowanceAmount = enableInfiniteAllowance ? infinite : amount;

      const gasLimit = await tokenContract.methods
        .approve(RANGEPOOL_ADDRESS, allowanceAmount)
        .estimateGas({ from: account });

      await tokenContract.methods
        .approve(RANGEPOOL_ADDRESS, allowanceAmount)
        .send({ from: account, gasLimit });

      setNeedsApproval(false);

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function handleAdd() {
    if (!tokenAddress || !amount || !account) return;

    const success = await handleApprove();
    if (!success) return;

    try {
      const gasLimit = await RANGEPOOL_CONTRACT.methods
        .add(tokenAddress, amount)
        .estimateGas({ from: account });
      await RANGEPOOL_CONTRACT.methods
        .add(tokenAddress, amount)
        .send({ from: account, gasLimit });
      getUserBalance();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleWithdraw() {
    if (!tokenAddress || !amount || !account) return;
    try {
      const gasLimit = await RANGEPOOL_CONTRACT.methods
        .remove(tokenAddress, amount)
        .estimateGas({ from: account });
      await RANGEPOOL_CONTRACT.methods
        .remove(tokenAddress, amount)
        .send({ from: account, gasLimit });
      getUserBalance();
    } catch {}
  }

  function handleAmountChange(e) {
    const int = BigNumber.from(Math.floor(e.target.value)).mul(
      BigNumber.from(10).pow(tokenDecimals)
    );

    const decimals = BigNumber.from(
      Math.floor((e.target.value % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(tokenDecimals - ROUNDING_DECIMALS));

    const newAmount = int.add(decimals);
    setAmount(newAmount);
    setFieldAmount(e.target.value);
  }

  function handleAddTabClick() {
    setAmount(BigNumber.from(0));
    setSelectedMode(MODES.ADD);
  }

  function handleWithdrawTabClick() {
    setAmount(BigNumber.from(0));
    setSelectedMode(MODES.WITHDRAW);
  }

  function handleCheckboxChange() {
    setEnableInfiniteAllowance(!enableInfiniteAllowance);
  }

  async function handleMaxWithdraw() {
    try {
      const currentToken = tokens.find((item) => item.symbol === token);
      const { address } = currentToken;

      const balance = BigNumber.from(
        await RANGEPOOL_CONTRACT.methods.balanceOf(account).call()
      );

      const maxCanRemove = BigNumber.from(
        await RANGEPOOL_CONTRACT.methods.maxCanRemove(address).call()
      );

      if (maxCanRemove.gt(balance)) {
        setAmount(balance);
      } else {
        setAmount(maxCanRemove);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMaxAdd() {
    const balance = BigNumber.from(
      await RANGEPOOL_CONTRACT.methods.balanceOf(account).call()
    );

    if (tokenMaxAdd.gt(balance)) {
      setAmount(balance);
    } else {
      setAmount(tokenMaxAdd);
    }
  }

  useEffect(() => {
    const int = BigNumber.from(Math.floor(fieldAmount)).mul(
      BigNumber.from(10).pow(tokenDecimals)
    );

    const decimals = BigNumber.from(
      Math.floor((fieldAmount % 1) * 10 ** ROUNDING_DECIMALS)
    ).mul(BigNumber.from(10).pow(tokenDecimals - ROUNDING_DECIMALS));

    const simulated = int.add(decimals);

    if (!amount.eq(simulated)) {
      const newFieldAmount =
        amount
          .div(BigNumber.from(10).pow(tokenDecimals - ROUNDING_DECIMALS))
          .toNumber() /
        10 ** ROUNDING_DECIMALS;

      setFieldAmount(newFieldAmount);
    }
  }, [amount]);

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
      <Grid item container alignItems="center" justifyContent="center">
        <Grid item>
          <UserLiquidityHeader>Your position</UserLiquidityHeader>
          <UserLiquidityBalance>
            {formatNumber(currentPosition)}
          </UserLiquidityBalance>
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
              value={fieldAmount}
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
