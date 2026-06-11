"use client";

import { useEffect, useState } from "react";
import {
  getAddress,
  getNetworkDetails,
  isAllowed,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";

type WalletState = {
  address: string;
  network: string;
};

type StellarWalletButtonProps = {
  className?: string;
};

const shortenAddress = (address: string) =>
  `${address.slice(0, 5)}...${address.slice(-5)}`;

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Unable to connect wallet.";
};

export function StellarWalletButton({ className = "" }: StellarWalletButtonProps) {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [status, setStatus] = useState("Connect wallet");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreWallet = async () => {
      const connected = await isConnected();

      if (connected.error || !connected.isConnected) {
        return;
      }

      const allowed = await isAllowed();

      if (allowed.error || !allowed.isAllowed) {
        return;
      }

      const [addressResult, networkResult] = await Promise.all([
        getAddress(),
        getNetworkDetails(),
      ]);

      if (!isMounted || addressResult.error || !addressResult.address) {
        return;
      }

      setWallet({
        address: addressResult.address,
        network: networkResult.error ? "Stellar" : networkResult.network,
      });
      setStatus("Wallet connected");
    };

    restoreWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  const connectWallet = async () => {
    setIsPending(true);
    setErrorMessage("");
    setStatus("Connecting...");

    try {
      const connected = await isConnected();

      if (connected.error || !connected.isConnected) {
        throw new Error("Install Freighter to connect a Stellar wallet.");
      }

      const access = await requestAccess();

      if (access.error || !access.address) {
        throw new Error(getErrorMessage(access.error));
      }

      const network = await getNetworkDetails();

      setWallet({
        address: access.address,
        network: network.error ? "Stellar" : network.network,
      });
      setStatus("Wallet connected");
    } catch (error) {
      setWallet(null);
      setStatus("Connect wallet");
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  const clearWallet = () => {
    setWallet(null);
    setStatus("Connect wallet");
    setErrorMessage("");
  };

  if (wallet) {
    return (
      <div className={`wallet-connect ${className}`.trim()}>
        <button
          type="button"
          className="wallet-chip"
          onClick={clearWallet}
          aria-label="Clear connected wallet"
        >
          <span>{wallet.network}</span>
          <strong>{shortenAddress(wallet.address)}</strong>
        </button>
      </div>
    );
  }

  return (
    <div className={`wallet-connect ${className}`.trim()}>
      <button
        type="button"
        className="lime-button"
        onClick={connectWallet}
        disabled={isPending}
        aria-busy={isPending}
      >
        {status}
      </button>
      {errorMessage ? <small role="status">{errorMessage}</small> : null}
    </div>
  );
}
