import create from "zustand";
import { WalletType } from "@/types/wallet.type";
import STORAGE_KEY from "@/constants/storage-key";
import localStorageService from "@/services/local-storage.service";
import { NetworkID } from "@/constants/network-id";

const initialStore = {
  isConnect: false,
  walletType: "",
  errorMessage: "",
  currentAccount: "",
  myAccount: "",
  chainId: 0 as NetworkID,
};
type InitialStoreType = typeof initialStore;
interface IUseConnector extends InitialStoreType {
  checkConnection: () => Promise<void>;
  connectMetamask: () => Promise<void>;
  getAccountMetamask: () => Promise<void>;
  getAccountChangeMetamask: () => Promise<void>;
  getChainId: () => Promise<void>;
  getChainIdChangeMetamask: () => Promise<void>;
}

const useConnector = create<IUseConnector>((set, get) => ({
  ...initialStore,
  checkConnection: async () => {
    if (typeof window !== "undefined") {
      const isConnect = localStorageService.getItem(STORAGE_KEY.CONNECTED);
      const walletType = localStorageService.getItem(STORAGE_KEY.WALLET_TYPE);
      const chainId = localStorageService.getItem(STORAGE_KEY.CHAIN_ID);
      if (isConnect && walletType === WalletType.METAMASK) {
        set({ isConnect: true });
        set({ chainId: chainId });
        await get().getAccountChangeMetamask();
        await get().getAccountMetamask();
        await get().getChainId();
        await get().getChainIdChangeMetamask();
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
  getChainId: async () => {
    if (typeof window.ethereum !== "undefined") {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (chainId) {
        localStorageService.setItem(STORAGE_KEY.CHAIN_ID, Number(chainId));
        set({ chainId: Number(chainId) });
      }
    }
  },
  getChainIdChangeMetamask: async () => {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.on("chainChanged", (chainId) => {
        if (chainId) {
          set({ chainId: Number(chainId) });
          window.location.reload();
        }
      });
    }
  },
}));

export default useConnector;
