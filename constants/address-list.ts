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
  vesting: "0x0000000000000000000000000000000000000000",
};

const bkcTest = {
  TT: "0xFc1E799dbA823e93e482e70B1A8d06AF1ffE2be3",
  TokenVesting: "0xb221E4E9A770D3a8476Cf6f94CAE904878d8f1bD",
};
