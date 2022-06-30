import { getAddressList } from "@/constants/address-list";
import { getSigner } from "@/utils/ethereum";
import dayjs from "dayjs";
import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout";

import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import useConnector from "@/store/use-connector";
import { parseEther } from "ethers/lib/utils";
import { formatNumber } from "@/utils/common";
import { MetmaskErrorType } from "@/types/error.type";
import useTokenVestingContract from "@/hooks/use-tokenvesting";
dayjs.extend(duration);
dayjs.extend(relativeTime);

const Button = ({
  name,
  onClick,
}: {
  name: string;
  onClick: () => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      className="border px-4 py-2"
      onClick={async () => {
        setIsLoading(true);
        await onClick();
        setIsLoading(false);
      }}
    >
      {isLoading ? "Processing..." : name}{" "}
    </button>
  );
};

const dateToSeconds = (date: string) =>
  dayjs(date, "YYYY-MM-DD").startOf("day").unix();
const today = dayjs().startOf("day").format("YYYY-MM-DD");

const Home: NextPage = () => {
  const { currentAccount, chainId } = useConnector();

  const signer = getSigner();
  const addressList = useMemo(() => getAddressList(chainId), [chainId]);
  const [params, setParams] = useState({
    start: today,
    end: dayjs(today).add(1, "day").format("YYYY-MM-DD"),
    cliff: today,
    revocable: 1,
    amount: "0",
    beneficiary: "",
  });

  const {
    tokenVesting,
    onInit,
    getReleasedToken,
    getReleaseableToken,
    contractDetail,
  } = useTokenVestingContract(addressList.TokenVesting, signer, currentAccount);

  const duration = dayjs
    .duration(dayjs(params.end).diff(params.start))
    .humanize();

  const onCreate = async () => {
    try {
      if (tokenVesting) {
        const cliff = dateToSeconds(params.cliff) - dateToSeconds(params.start);
        const duration =
          dateToSeconds(params.end) - (dateToSeconds(params.start) + cliff);

        if (duration <= 0) {
          alert("Cliff date must be before end date");
          return;
        }
        const payload = {
          ...params,
          start: dateToSeconds(params.start),
          end: dateToSeconds(params.end),
          cliff: cliff || 0,
          amount: Number(params.amount) > 0 ? parseEther(params.amount) : 0,
          duration,
        };

        const tx = await tokenVesting.createVestingSchedule(
          payload.beneficiary,
          payload.start,
          payload.cliff,
          payload.duration,
          payload.revocable,
          payload.amount
        );
        const res = await tx.wait();
        console.log("create success!", res.transactionHash);
        await onInit();
      }
    } catch (error) {
      const { reason } = error as MetmaskErrorType;
      console.log(reason);
    }
  };

  const onClaimToken = async () => {
    try {
      if (tokenVesting) {
        const lastSchedule =
          await tokenVesting.getLastVestingScheduleIdForHolder(currentAccount);

        const tx = await tokenVesting.release(
          lastSchedule,
          parseEther(contractDetail.releaseableToken)
        );
        await tx.wait();
        getReleasedToken();
        getReleaseableToken();
      }
    } catch (error) {
      const { reason } = error as MetmaskErrorType;
      console.log(reason);
    }
  };

  const onRevoked = async () => {
    try {
      if (tokenVesting) {
        const lastSchedule =
          await tokenVesting.getLastVestingScheduleIdForHolder(currentAccount);

        const tx = await tokenVesting.revoke(lastSchedule);
        await tx.wait();
        getReleasedToken();
      }
    } catch (error) {
      const { reason } = error as MetmaskErrorType;
      console.log(reason);
    }
  };

  useEffect(() => {
    onInit();
  }, [currentAccount]);

  return (
    <Layout>
      <div>
        <h1> Token Vesting: {tokenVesting?.address}</h1>
        <p>Token: {contractDetail.token}</p>
        <p>Total Balance: {contractDetail.balance}</p>
      </div>

      <div className="mt-5 flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2 border p-4">
          <p> Create Schedule</p>
          <div className="flex gap-x-5">
            <label htmlFor="start">
              Start:
              <input
                name="start"
                type="date"
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
                defaultValue={today}
              />
            </label>
            <label htmlFor="end">
              End:
              <input
                name="end"
                type="date"
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
                defaultValue={params.end}
                min={params.start}
              />
            </label>
          </div>
          <div className="flex gap-x-5">
            <label htmlFor="start">
              Start At(Cliff):
              <input
                name="cliff"
                type="date"
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    cliff: e.target.value,
                  }))
                }
                defaultValue={today}
                min={params.start}
                max={params.end}
              />
            </label>
          </div>
          <p>Duration: {duration}</p>
          <div>
            <label htmlFor="amount">
              Amount
              <input
                name="amount"
                type="number"
                min={0}
                className="ml-2 border"
                required
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div>
            <label htmlFor="beneficiary">
              Beneficiary
              <input
                name="beneficiary"
                type="text"
                className="ml-2 border"
                required
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    beneficiary: e.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div>
            <label htmlFor="revocable">
              <input
                name="revocable"
                type="checkbox"
                defaultChecked={Boolean(params.revocable)}
                className="mr-2"
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    revocable: e.target.checked ? 1 : 0,
                  }))
                }
              />
              Revocable
            </label>
          </div>
          <div>
            <Button name="Create" onClick={onCreate} />
          </div>
        </div>

        {contractDetail.isFetched && (
          <div className="flex flex-col gap-y-2 border p-4">
            <h1 className="border-b mb-5">User Claiming Section</h1>
            <p>Total Claim: {formatNumber(contractDetail.releasedToken)}</p>

            {contractDetail.isRevoked ? (
              "Schedule has been revoked."
            ) : (
              <div className="flex flex-col gap-y-2">
                <div>
                  <span>
                    {" "}
                    Claimable Token{" "}
                    {formatNumber(contractDetail.releaseableToken)}
                  </span>
                  <button
                    className="border px-4 py-2 ml-2"
                    onClick={getReleaseableToken}
                  >
                    Refresh
                  </button>
                </div>
                <div className="flex gap-x-10">
                  <Button name="Claim Token" onClick={onClaimToken} />
                  <Button name="Revoke" onClick={onRevoked} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
