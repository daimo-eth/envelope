"use client";

import { useEffect, useState } from "react";
import { ScratchToReveal } from "@/components/magicui/scratch-to-reveal";
import peanut from "@squirrel-labs/peanut-sdk";
import { Dancing_Script } from "next/font/google";
import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import Link from "next/link";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

// Initialize the Viem client for ENS resolution
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export default function ClaimPage() {
  const [linkDetails, setLinkDetails] =
    useState<PeanutGetLinkDetailsResponse | null>();
  const [claiming, setClaiming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [addressEntered, setAddressEntered] = useState(false);
  const [addressValidating, setAddressValidating] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("");

  // Parse the link from URL
  useEffect(() => {
    const link = window.location.href;
    peanut
      .getLinkDetails({ link })
      .then((details) => setLinkDetails(details))
      .catch((e) => {
        console.error("failed to get link details:", e);
        setLinkDetails(null);
      });
  }, []);

  // Validate and resolve address
  const validateAndResolveAddress = async (input: string) => {
    setAddressValidating(true);
    setError(null);
    let finalAddress = "";

    try {
      // Check if it's a valid Ethereum address
      if (isAddress(input)) {
        finalAddress = input;
      }
      // Check if it's an ENS name
      else if (input.endsWith(".eth")) {
        const resolvedEns = await client.getEnsAddress({
          name: input.toLowerCase(),
        });
        if (resolvedEns) {
          finalAddress = resolvedEns;
        } else {
          setError("ENS name could not be resolved.");
          setAddressValidating(false);
          return false;
        }
      }
      // Not a valid address format
      else {
        setError("Please enter a valid Ethereum address or ENS name.");
        setAddressValidating(false);
        return false;
      }

      setResolvedAddress(finalAddress);
      setAddressValidating(false);
      return true;
    } catch (e) {
      setError(
        `Address validation failed: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
      setAddressValidating(false);
      return false;
    }
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientAddress.trim()) {
      setError("Please enter a valid address");
      return;
    }

    const isValid = await validateAndResolveAddress(recipientAddress);

    if (isValid) {
      setAddressEntered(true);
    }
  };

  const handleClaim = async () => {
    if (!resolvedAddress) {
      setError("Please enter a valid wallet address first");
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      const link = window.location.href;

      // Use peanut's gasless claim function with the resolved address
      const claimedLinkResponse = await peanut.claimLinkGasless({
        APIKey: process.env.NEXT_PUBLIC_PEANUT_API_KEY || "",
        link,
        recipientAddress: resolvedAddress,
      });

      setTxHash(claimedLinkResponse.txHash);
      console.log("claim successful:", claimedLinkResponse);
    } catch (e) {
      console.error("claim failed:", e);
      setError(`Claim failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setClaiming(false);
    }
  };

  if (linkDetails === null) {
    return (
      <MainLayout>
        <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 rounded-2xl pointer-events-none"></div>

          <div className="relative text-center space-y-6 py-6">
            <div className="mb-6 relative">
              <div className="w-24 h-16 mx-auto relative opacity-60">
                <div className="absolute inset-0 border-2 border-dashed border-amber-600 bg-amber-50"></div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-amber-100 border-2 border-dashed border-amber-600 origin-top transform rotate-45 translate-y-1"></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-amber-900">
              Invalid Surprise Link
            </h2>
            <p className="text-amber-700">
              This link appears to be invalid or expired.
            </p>

            <Link
              href="/"
              className="inline-block mt-6 py-3 px-6 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Create a New Surprise
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  } else if (linkDetails == null) {
    return (
      <MainLayout>
        <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100 flex items-center justify-center min-h-[300px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-amber-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-amber-100 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  } else if (linkDetails.claimed) {
    return (
      <MainLayout>
        <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 rounded-2xl pointer-events-none"></div>

          <div className="relative text-center space-y-6 py-6">
            <div className="mb-6 relative">
              <div className="w-24 h-16 mx-auto relative opacity-70">
                <div className="absolute inset-0 border-2 border-amber-600 bg-amber-50"></div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-amber-100 border-2 border-amber-600 origin-top transform rotate-180"></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-amber-900">
              Surprise Already Claimed
            </h2>
            <p className="text-amber-700">
              This surprise envelope has already been opened.
            </p>

            <Link
              href="/"
              className="inline-block mt-6 py-3 px-6 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Create a New Surprise
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const amount = Number(linkDetails.tokenAmount);
  const displayAddress = resolvedAddress || recipientAddress;

  return (
    <MainLayout>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Funds are on their way!</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center mt-4">
                <div className="text-5xl font-bold text-amber-600 mb-2">
                  ${amount.toFixed(2)}
                </div>
                <div className="text-amber-800 text-lg">is yours!</div>
              </div>

              <div className="text-sm text-amber-700 mt-2">
                Sent to: {displayAddress.slice(0, 8)}...
                {displayAddress.slice(-6)}
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
            // Address input or scratch state
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-amber-900">
                You have a surprise!
              </h2>

              {!addressEntered ? (
                // Address input form
                <div className="mt-6 space-y-4">
                  <p className="text-amber-700">
                    Enter your wallet address or ENS name to claim the surprise
                  </p>

                  <form onSubmit={handleSubmitAddress} className="space-y-4">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x... or name.eth"
                        className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white/80 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors text-amber-900 placeholder-amber-400"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addressValidating}
                      className={`w-full py-3 px-4 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center ${
                        addressValidating ? "opacity-70 cursor-wait" : ""
                      }`}
                    >
                      {addressValidating ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Validating...
                        </>
                      ) : (
                        "Continue to Claim"
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                // Show scratch card when address is entered
                <div className="space-y-6">
                  <p className="text-amber-700">
                    Scratch below to claim your gift!
                  </p>

                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-sm text-amber-700">
                      Sending to: {displayAddress.slice(0, 8)}...
                      {displayAddress.slice(-6)}
                    </p>
                    <button
                      onClick={() => setAddressEntered(false)}
                      className="text-xs text-amber-600 underline mt-1"
                    >
                      Change address
                    </button>
                  </div>

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
                            <svg
                              className="animate-spin h-10 w-10 text-amber-600 mb-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
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
    </MainLayout>
  );
}

// Main layout component without RainbowKitProvider
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="flex flex-col items-center justify-center max-h-full max-w-md w-full overflow-hidden">
        <div className="mb-6 sm:mb-8">
          <h1
            className={`${dancingScript.className} text-5xl font-bold text-center text-amber-900 relative transform -rotate-2 drop-shadow-lg`}
          >
            Surprise Envelope
          </h1>
          <div className="w-48 h-1 bg-amber-300 mx-auto rounded-full transform rotate-2 mt-2 shadow-sm"></div>
        </div>
        <div className="overflow-hidden max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface PeanutGetLinkDetailsResponse {
  link: string;
  chainId: string;
  depositIndex: number;
  contractVersion: string;
  tokenAmount: string;
  claimed: boolean;
}