import { erc20_interface } from "./constants";

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
}
