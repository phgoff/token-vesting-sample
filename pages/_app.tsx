import "../styles/globals.css";
import type { AppProps } from "next/app";
import useConnector from "@/store/useConnector";
import { useEffect } from "react";

declare global {
  interface Window {
    ethereum: any;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const checkConnect = useConnector((state) => state.checkConnect);

  useEffect(() => {
    checkConnect();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
