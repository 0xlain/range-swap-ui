import { BigNumber } from "@ethersproject/bignumber";
import { erc20_interface, RANGEPOOL_ADDRESS } from "./constants";

const Contract = require("web3-eth-contract");

export default class Token {
  constructor(address, provider) {
    this.address = address;

    this.contract = new Contract(erc20_interface, address);

    this.contract.setProvider(provider);
  }

  async getSymbol() {
    this.symbol = await this.contract.methods.symbol().call();
  }

  async getDecimals() {
    this.decimals = await this.contract.methods.decimals().call();
  }

  async getLiquidity() {
    const coeff = BigNumber.from(10).pow(this.decimals);
    const balance = BigNumber.from(
      await this.contract.methods.balanceOf(RANGEPOOL_ADDRESS).call()
    ).div(coeff);

    this.liquidity = balance.toNumber();
  }
}
