const Contract = require("web3-eth-contract");

const rangepool_interface = require("../abi/rangepool.json");
export const erc20_interface = require("../abi/erc20.json");

export const NUM_TOKENS = 8;

export const RANGEPOOL_ADDRESS = "0x66e901B750B6fFdBE2262569089bb61A27A19928";

export const RANGEPOOL_CONTRACT = new Contract(
  JSON.parse(rangepool_interface),
  RANGEPOOL_ADDRESS
);
