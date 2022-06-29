import useConnector from "@/store/useConnector";
import { truncateAddress } from "@/utils/common";
import ConnectWallet from "../connect/connect-wallet";

const Navbar = () => {
  const { isConnect, currentAccount } = useConnector();

  return (
    <div className="h-nav bg-orange-500 flex justify-between items-center px-10">
      <div>Logo</div>

      {isConnect ? (
        <div>{truncateAddress(currentAccount)}</div>
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
};

export default Navbar;
