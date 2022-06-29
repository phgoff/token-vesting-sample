import { getAddressList } from "@/constants/address-list";
import { NetworkID } from "@/constants/network-id";
import { TokenVesting, TokenVesting__factory } from "@/typechain";
import { getSigner } from "@/utils/ethereum";
import dayjs from "dayjs";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Layout from "../components/layout";

import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import useConnector from "@/store/useConnector";
import { formatEther, parseEther } from "ethers/lib/utils";
import { formatNumber } from "@/utils/common";

dayjs.extend(duration);
dayjs.extend(relativeTime);

const dateToSeconds = (date: string) =>
  dayjs(date, "YYYY-MM-DD").startOf("day").unix();
const today = dayjs().startOf("day").format("YYYY-MM-DD");

let tokenVesting: TokenVesting;

const Home: NextPage = () => {
  const network = NetworkID.BKC_TEST;
  const addressList = getAddressList(network);
  const { currentAccount } = useConnector();
  const signer = getSigner();

  const [params, setParams] = useState({
    start: today,
    end: dayjs(today).add(1, "day").format("YYYY-MM-DD"),
    cliff: today,
    revocable: 1,
    amount: "0",
    beneficiary: currentAccount,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [releasedToken, setReleasedToken] = useState("0");
  const [releaseableToken, setReleaseableToken] = useState("0");

  const duration = dayjs
    .duration(dayjs(params.end).diff(params.start))
    .humanize();

  const computeReleaseableToken = async () => {
    try {
      const lastSchedule = await tokenVesting.getLastVestingScheduleIdForHolder(
        currentAccount
      );

      const releaseable = await tokenVesting.computeReleasableAmount(
        lastSchedule
      );

      setReleaseableToken(formatEther(releaseable));
    } catch (error) {
      setReleaseableToken("0");
    }
  };

  const getReleasedToken = async () => {
    try {
      const mySchedule = await tokenVesting.getLastVestingScheduleForHolder(
        currentAccount
      );
      if (mySchedule) setReleasedToken(formatEther(mySchedule.released));
    } catch (error) {
      setReleasedToken("0");
    }
  };

  const onCreate = async () => {
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
    console.log("success", res);
  };

  const onClaimToken = async () => {
    setIsLoading(true);
    const lastSchedule = await tokenVesting.getLastVestingScheduleIdForHolder(
      currentAccount
    );

    const tx = await tokenVesting.release(
      lastSchedule,
      parseEther(releaseableToken)
    );
    await tx.wait();
    getReleasedToken();
    computeReleaseableToken();
    setIsLoading(false);
  };

  useEffect(() => {
    if (signer) {
      tokenVesting = TokenVesting__factory.connect(
        addressList.TokenVesting,
        signer
      );
    }
  }, [signer]);

  useEffect(() => {
    if (tokenVesting && currentAccount) {
      getReleasedToken();
      computeReleaseableToken();
    }
  }, [tokenVesting, currentAccount]);

  return (
    <Layout>
      <h1> Token Vesting {tokenVesting?.address}</h1>
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
                min={0}
                className="ml-2 border"
                defaultValue={params.beneficiary}
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
            <button className="border px-4 py-2" onClick={onCreate}>
              Create
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-y-2 border p-4">
          <p>Total Claim: {formatNumber(releasedToken)}</p>
          <div className="">
            <span> Claimable Token {formatNumber(releaseableToken)}</span>
            <button
              className="border px-4 py-2 ml-2"
              onClick={computeReleaseableToken}
            >
              Refresh
            </button>
          </div>

          <div className="">
            <button className="border px-4 py-2" onClick={onClaimToken}>
              {isLoading ? "Claming..." : "Claim Token"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
