import "../styles/globals.css";
import type { AppProps } from "next/app";
import useConnector from "@/store/use-connector";
import { useEffect } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const { checkConnection } = useConnector();

  useEffect(() => {
    checkConnection();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
