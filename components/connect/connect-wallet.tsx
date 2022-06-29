import useConnector from "@/store/useConnector";
import { WalletType } from "@/types/wallet.type";

const ConnectWallet = () => {
  const { connectMetamask, checkConnect } = useConnector();

  const walletProviders = [
    {
      type: WalletType.METAMASK,
      name: "MetaMask",
    },
    // {
    //   type: WalletType.BITKUB_NEXT,
    //   name: "Bitkub Next",
    // },
  ];

  const handleConnectWallet = async (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.METAMASK: {
        handleConnectMetamask();
        break;
      }
      case WalletType.BITKUB_NEXT: {
        // TODO: Bitkub Next
        break;
      }
    }
  };

  const handleConnectMetamask = async () => {
    try {
      await connectMetamask();
      await checkConnect();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {walletProviders &&
        walletProviders.map((item) => {
          return (
            <button
              key={item.name}
              onClick={() => handleConnectWallet(item.type)}
            >
              <span>Connect {item.name}</span>
            </button>
          );
        })}
    </div>
  );
};

export default ConnectWallet;
