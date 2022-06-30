import { TokenVesting__factory } from "@/typechain";
import { MetmaskErrorType } from "@/types/error.type";
import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";

export default function useTokenVestingContract(
  address: string | null,
  signer: ethers.Signer | null,
  currentAccount: string | null
) {
  const [contractDetail, setContractDetail] = useState({
    token: "",
    balance: "0",
    releasedToken: "0",
    releaseableToken: "0",
    isRevoked: false,
    isFetched: false,
  });
  const tokenVesting = useMemo(() => {
    if (!address || !signer) {
      return null;
    }
    return TokenVesting__factory.connect(address, signer);
  }, [signer, address]);

  const onInit = async () => {
    if (tokenVesting) {
      const token = await tokenVesting._token();
      const balance = await tokenVesting.getWithdrawableAmount();
      await getReleasedToken();
      await getReleaseableToken();
      setContractDetail((prev) => ({
        ...prev,
        token,
        balance: formatEther(balance),
        isFetched: true,
      }));
    }
  };

  const getReleasedToken = async () => {
    try {
      if (tokenVesting && currentAccount) {
        const mySchedule = await tokenVesting.getLastVestingScheduleForHolder(
          currentAccount
        );
        if (mySchedule) {
          setContractDetail((prev) => ({
            ...prev,
            releasedToken: formatEther(mySchedule.released),
            isRevoked: Number(mySchedule.revoked) === 1 ? true : false,
          }));
        }
      }
    } catch (error) {
      const { reason } = error as MetmaskErrorType;
      console.log(reason);
      setContractDetail((prev) => ({
        ...prev,
        releasedToken: "0",
      }));
    }
  };

  const getReleaseableToken = async () => {
    try {
      if (tokenVesting && currentAccount) {
        const mySchedule = await tokenVesting.getLastVestingScheduleForHolder(
          currentAccount
        );
        if (mySchedule && !Number(mySchedule.revoked)) {
          const lastSchedule =
            await tokenVesting.getLastVestingScheduleIdForHolder(
              currentAccount
            );

          const releaseable = await tokenVesting.computeReleasableAmount(
            lastSchedule
          );

          setContractDetail((prev) => ({
            ...prev,
            releaseableToken: formatEther(releaseable),
          }));
        }
      }
    } catch (error) {
      const { reason, code } = error as MetmaskErrorType;
      console.log(reason, code);
      setContractDetail((prev) => ({
        ...prev,
        releaseableToken: "0",
      }));
    }
  };

  return {
    tokenVesting,
    contractDetail,
    onInit,
    getReleasedToken,
    getReleaseableToken,
  };
}
