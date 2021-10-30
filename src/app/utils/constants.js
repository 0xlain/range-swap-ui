const Contract = require("web3-eth-contract");

const rangepool_interface = require("./abi/rangepool.json");
export const erc20_interface = require("./abi/erc20.json");

export const NUM_TOKENS = 6;

export const MAINNET_ADDRESS = "0x66e901B750B6fFdBE2262569089bb61A27A19928";
export const ROPSTEN_ADDRESS = "0x2c5b00d0f160Ce9D7be9f863E3f7e69bd9F525c4";

export const MIANNET_CONTRACT = new Contract(
  JSON.parse(rangepool_interface),
  MAINNET_ADDRESS
);

export const ROPSTEN_CONTRACT = new Contract(
  JSON.parse(rangepool_interface),
  ROPSTEN_ADDRESS
);
