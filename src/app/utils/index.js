import { BigNumber } from "@ethersproject/bignumber";
import { TOKEN_DECIMALS, ROUNDING_DECIMALS } from "../utils/constants";

export const formatNumber = (number) => {
  if (!number || typeof number !== "number") {
    return number;
  }

  return number.toLocaleString("en-US", { minimumFractionDigits: 4 });
};

export const formatUserBalance = (balance) => {
  if (!balance) {
    return balance;
  }
  const poolCoeff = BigNumber.from(10).pow(TOKEN_DECIMALS);

  const balanceDecimals = balance
    .mod(poolCoeff)
    .div(BigNumber.from(10).pow(TOKEN_DECIMALS - ROUNDING_DECIMALS))
    .toNumber();
  const balanceInteger = balance.div(poolCoeff).toNumber();

  const userBalance = balanceInteger + balanceDecimals;

  return formatNumber(userBalance);
};
