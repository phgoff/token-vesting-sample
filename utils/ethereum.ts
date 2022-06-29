import { ethers } from "ethers";

export const ethereum = () =>
  typeof window !== "undefined" ? (window as any).ethereum : null;

export const getProvider = () => {
  const url = `https://rpc.bitkubchain.io`;
  return new ethers.providers.JsonRpcProvider(url);
};

export const getSigner = () => {
  const eth = ethereum();
  if (!eth) {
    return null;
  }
  const provider = new ethers.providers.Web3Provider(eth);
  return provider?.getSigner();
};
