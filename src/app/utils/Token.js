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
}
