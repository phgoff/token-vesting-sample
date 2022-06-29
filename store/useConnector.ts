import create from "zustand";

import { WalletType } from "@/types/wallet.type";
import STORAGE_KEY from "@/constants/storage-key";
import localStorageService from "@/services/localStorage.service";

const initialStore = {
  isConnect: false,
  walletType: "",
  errorMessage: "",
  currentAccount: "",
  myAccount: "",
};

const useConnector = create((set: any, get: any) => ({
  ...initialStore,
  checkConnectionion: async () => {
    if (typeof window !== "undefined") {
      const isConnect = localStorageService.getItem(STORAGE_KEY.CONNECTED);
      const walletType = localStorageService.getItem(STORAGE_KEY.WALLET_TYPE);
      if (isConnect && walletType === WalletType.METAMASK) {
        set({ isConnect: true });
        await get().getAccountChangeMetamask();
        await get().getAccountMetamask();
      } else {
        set({ isConnect: false });
      }
    }
  },
  connectMetamask: async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        localStorageService.setItem(STORAGE_KEY.CONNECTED, true);
        localStorageService.setItem(
          STORAGE_KEY.WALLET_TYPE,
          WalletType.METAMASK
        );
        set({ isConnect: true, walletType: WalletType.METAMASK });
      } catch (error: unknown) {
        // const { code, message } = error;
        // if (code === 4001) {
        //   set({ errorMessage: message });
        // }
      }
    }
  },
  getAccountMetamask: async () => {
    if (typeof window.ethereum !== "undefined") {
      const ethAccounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const [currentAccount] = ethAccounts as string[];
      if (currentAccount) {
        set({ currentAccount });
      }
    }
  },
  getAccountChangeMetamask: async () => {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.on("accountsChanged", (accounts: unknown) => {
        const [accountChange] = accounts as string[];
        if (accountChange) {
          set({ currentAccount: accountChange });
        }
      });
    }
  },
}));

export default useConnector;
