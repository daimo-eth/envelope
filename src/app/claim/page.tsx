"use client";

import { OP_CHAIN_ID, createClaimTx, parsePeanutLink } from "@/chain/link";
import { useEffect, useState } from "react";
import { Hex } from "viem";
import { optimism } from "viem/chains";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

export default function ClaimPage() {
  const [linkParams, setLinkParams] = useState<{
    chainId: number;
    index: number;
    password: string;
  } | null>(null);

  useEffect(() => {
    const link = window.location.href;
    const params = parsePeanutLink(link);
    setLinkParams(params);
  }, []);

  const isValidParams =
    linkParams?.chainId === OP_CHAIN_ID && !!linkParams?.password;

  if (!isValidParams) {
    return (
      <div>
        <h1>invalid link</h1>
        <p>this link appears to be invalid or broken</p>
      </div>
    );
  }

  return (
    <RainbowKitProvider>
      <ClaimPageInner linkParams={linkParams} />
    </RainbowKitProvider>
  );
}

function ClaimPageInner({
  linkParams,
}: {
  linkParams: { chainId: number; index: number; password: string };
}) {
  const [claiming, setClaiming] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();

  // For demo purposes, we'll display a fixed amount
  const amount = 0.42;

  const handleClaim = async () => {
    if (!isConnected || !address || !walletClient || !linkParams) {
      setError("please connect your wallet first");
      return;
    }

    // Switch to Optimism if needed
    if (walletClient.chain.id !== OP_CHAIN_ID) {
      console.log("switching chain");
      try {
        await switchChain({ chainId: OP_CHAIN_ID });
      } catch {
        setError("failed to switch to optimism network");
        return;
      }
    }

    setClaiming(true);
    setError(null);

    try {
      const { calldata, address: contractAddress } = await createClaimTx({
        index: linkParams.index,
        password: linkParams.password,
        recipientAddress: address as Hex,
      });

      const hash = await walletClient.sendTransaction({
        chain: optimism,
        to: contractAddress,
        data: calldata,
      });
      setTxHash(hash);
    } catch (e) {
      console.error("claim failed:", e);
      setError(`claim failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div>
      <h1>receiving ${amount.toFixed(2)}</h1>

      {!isConnected ? (
        <div>
          <p>connect your wallet to claim</p>
          <ConnectButton />
        </div>
      ) : (
        <div>
          <button onClick={handleClaim} disabled={claiming || !!txHash}>
            {claiming ? "claiming..." : "claim"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {txHash && (
            <div style={{ marginTop: "20px" }}>
              <p>claim successful!</p>
              <a
                href={`https://optimistic.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                view transaction: {txHash.slice(0, 10)}...
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
