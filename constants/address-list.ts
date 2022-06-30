import { NetworkID } from "./network-id";

type AddressType<T> = T extends NetworkID.BKC
  ? typeof bkc
  : T extends NetworkID.BKC_TEST
  ? typeof bkcTest
  : typeof bkc;

export const getAddressList = <T extends NetworkID>(networkID: T) => {
  switch (networkID) {
    case NetworkID.BKC:
      return bkc as AddressType<T>;
    case NetworkID.BKC_TEST:
      return bkcTest as AddressType<T>;
    default:
      return bkc as AddressType<T>;
  }
};

const bkc = {
  TT: null,
  TokenVesting: null,
};

const bkcTest = {
  TT: "0xFc1E799dbA823e93e482e70B1A8d06AF1ffE2be3",
  TokenVesting: "0x2e0c29003b546cfaC6c94489BEA1c58c878513e7",
};
