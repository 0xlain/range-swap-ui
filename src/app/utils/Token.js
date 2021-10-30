import { BigNumber } from "@ethersproject/bignumber";
import { erc20_interface } from "./constants";

const Contract = require("web3-eth-contract");

export default class Token {
  constructor(address, provider, rangepoolContract) {
    this.address = address;
    this.rangepoolContract = rangepoolContract;

    this.contract = new Contract(erc20_interface, address);

    this.contract.setProvider(provider);
  }

  async getSymbol() {
    this.symbol = await this.contract.methods.symbol().call();
  }

  async getInfo() {
    this.info = await this.rangepoolContract.methods
      .tokenInfo(this.address)
      .call();
  }

  async getDecimals() {
    this.decimals = await this.contract.methods.decimals().call();
  }

  async getMaxAdd() {
    try {
      const max = BigNumber.from(
        await this.rangepoolContract.methods.maxCanAdd(this.address).call()
      );

      let lastMax = BigNumber.from(0);
      let currentMax = max;

      while (!lastMax.eq(currentMax)) {
        lastMax = currentMax;
        currentMax = await this._maxCanAdd(lastMax);
      }

      this.maxAdd = currentMax;
    } catch (e) {
      console.error(e);
      this.maxAdd = BigNumber.from(0);
    }
  }

  async _maxCanAdd(incoming) {
    try {
      const totalTokens = BigNumber.from(
        await this.rangepoolContract.methods.totalTokens().call()
      ).add(incoming);

      const highAP = BigNumber.from(this.info.highAP);
      const maximum = totalTokens.mul(highAP).div(BigNumber.from(10).pow(9));

      const balance = BigNumber.from(
        await this.contract.methods
          .balanceOf(this.rangepoolContract._address)
          .call()
      );

      const maxCanAdd = maximum.sub(balance);
      return maxCanAdd;
    } catch (e) {
      console.error(e);
      return BigNumber.from(0);
    }
  }
}
