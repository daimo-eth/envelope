"use client";

import { OP_CHAIN_ID, createClaimTx, parsePeanutLink } from "@/chain/link";
import { useEffect, useState } from "react";
import { Hex } from "viem";
import { optimism } from "viem/chains";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Dancing_Script } from "next/font/google";
import { ScratchToReveal } from "@/components/magicui/scratch-to-reveal";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
        <div className="relative mb-8">
          <h1 className={`${dancingScript.className} text-5xl font-bold text-center text-amber-900 relative transform -rotate-2 drop-shadow-lg`}>
            Surprise Envelope
          </h1>
          <div className="w-48 h-1 bg-amber-300 mx-auto rounded-full transform rotate-2 mt-2 shadow-sm"></div>
        </div>
        
        <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 rounded-2xl pointer-events-none"></div>
          
          <div className="relative text-center space-y-6 py-6">
            {/* Broken envelope animation */}
            <div className="mb-6 relative">
              <div className="w-24 h-16 mx-auto relative opacity-60">
                <div className="absolute inset-0 border-2 border-dashed border-amber-600 bg-amber-50"></div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-amber-100 border-2 border-dashed border-amber-600 origin-top transform rotate-45 translate-y-1"></div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-amber-900">Invalid Surprise Link</h2>
            <p className="text-amber-700">This link appears to be invalid or expired.</p>
            
            <a href="/" className="inline-block mt-6 py-3 px-6 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
              Create a New Surprise
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RainbowKitProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
        <div className="relative mb-8">
          <h1 className={`${dancingScript.className} text-5xl font-bold text-center text-amber-900 relative transform -rotate-2 drop-shadow-lg`}>
            Surprise Envelope
          </h1>
          <div className="w-48 h-1 bg-amber-300 mx-auto rounded-full transform rotate-2 mt-2 shadow-sm"></div>
        </div>
        
        <ClaimPageInner linkParams={linkParams} />
      </div>
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
  const [revealedAmount, setRevealedAmount] = useState(false);

  // For demo purposes, we'll display a fixed amount
  const amount = 0.42;

  const handleClaim = async () => {
    if (!isConnected || !address || !walletClient || !linkParams) {
      setError("Please connect your wallet first");
      return;
    }

    // Switch to Optimism if needed
    if (walletClient.chain.id !== OP_CHAIN_ID) {
      console.log("switching chain");
      try {
        await switchChain({ chainId: OP_CHAIN_ID });
      } catch {
        setError("Failed to switch to Optimism network");
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
      setError(`Claim failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 rounded-2xl pointer-events-none"></div>
      
      <div className="relative space-y-6 py-4 text-center">
        {txHash ? (
          // Success state after claiming
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-amber-900">
              You&apos;ve claimed your surprise!
            </h2>
            
            <div className="py-4 px-6 bg-green-50 rounded-lg border border-green-200 inline-block">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Funds are in your wallet!</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center mt-4">
              <div className="text-5xl font-bold text-amber-600 mb-2">
                ${amount.toFixed(2)}
              </div>
              <div className="text-amber-800 text-lg">
                is yours!
              </div>
            </div>
            
            <a
              href={`https://optimistic.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 py-2 px-4 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
            >
              View Transaction Details
            </a>
          </div>
        ) : (
          // Scratch to claim state
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-amber-900">
              You have a surprise!
            </h2>
            
            {!isConnected ? (
              // Connect wallet first
              <div className="mt-6 space-y-4">
                <p className="text-amber-700">Connect your wallet to claim your surprise</p>
                <div className="flex justify-center py-2">
                  <ConnectButton />
                </div>
              </div>
            ) : (
              // Show scratch card when connected
              <div className="space-y-6">
                <p className="text-amber-700">
                  Scratch below to claim your gift!
                </p>
                
                {/* Scratch to claim component */}
                <div className="flex justify-center my-8">
                  <ScratchToReveal
                    width={200}
                    height={200}
                    minScratchPercentage={60}
                    className="flex items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-300"
                    gradientColors={["#f59e0b", "#d97706", "#92400e"]}
                    onComplete={handleClaim}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {claiming ? (
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-10 w-10 text-amber-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-amber-800">Claiming...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="text-5xl font-bold text-amber-600 mb-2">
                            ${amount.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScratchToReveal>
                </div>
                
                <p className="text-sm text-amber-600">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
