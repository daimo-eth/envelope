"use client";

import { createLinkCall, getLinkFromDeposit, LinkCall } from "@/chain/link";
import { SendButton } from "@/components/SendButton";
import { DaimoPayCompletedEvent } from "@daimo/pay";
import { Dancing_Script } from "next/font/google";
import { FormEvent, useEffect, useState } from "react";
import { Hex } from "viem";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export default function Home() {
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [contactValue, setContactValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [txHash, setTxHash] = useState<Hex>();
  const [linkData, setLinkData] = useState<LinkCall>();
  const [peanutLink, setPeanutLink] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Generate link data when component mounts or amount changes
  useEffect(() => {
    createLinkCall({ usd: selectedAmount })
      .then((data) => setLinkData(data))
      .catch(console.error);
  }, [selectedAmount]);

  // Check if the Web Share API is supported
  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handlePaymentCompleted = async (e: DaimoPayCompletedEvent) => {
    console.log("payment completed:", e);
    const hash = e.txHash as Hex;
    setTxHash(hash);
    setIsSubmitting(true);

    if (linkData) {
      setLoading(true);
      try {
        const link = await getLinkFromDeposit({
          txHash: hash,
          password: linkData.password,
        });
        setPeanutLink(link);
        setShowSuccessView(true);
      } catch (error) {
        console.error("failed to generate peanut link:", error);
      } finally {
        setLoading(false);
        setTimeout(() => setIsSubmitting(false), 2000);
      }
    }
  };

  const handleReset = () => {
    setShowSuccessView(false);
    setPeanutLink(undefined);
    setTxHash(undefined);
    setContactValue("");
    createLinkCall({ usd: selectedAmount })
      .then((data) => setLinkData(data))
      .catch(console.error);
  };

  // Generate sharing links based on contact type and value
  const getShareLink = () => {
    if (!peanutLink || !contactValue) return "";

    const message = `Here's your surprise gift! Claim it here: ${peanutLink}`;
    const encodedMessage = encodeURIComponent(message);

    if (contactType === "email") {
      const subject = encodeURIComponent("A Surprise Gift For You!");
      return `mailto:${contactValue}?subject=${subject}&body=${encodedMessage}`;
    } else {
      // Format phone number - remove any non-digit characters
      const formattedPhone = contactValue.replace(/\D/g, "");
      return `sms:${formattedPhone}?body=${encodedMessage}`;
    }
  };

  // Handle native sharing
  const handleShare = async () => {
    if (!peanutLink) return;
    
    try {
      await navigator.share({
        title: 'Surprise Gift!',
        text: 'Here\'s your surprise gift! Claim it here:',
        url: peanutLink
      });
      console.log('Link shared successfully');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="relative mb-8">
        <h1
          className={`${dancingScript.className} text-5xl font-bold text-center text-amber-900 relative transform -rotate-2 drop-shadow-lg`}
        >
          Surprise Envelope
        </h1>
        <div className="w-48 h-1 bg-amber-300 mx-auto rounded-full transform rotate-2 mt-2 shadow-sm"></div>
      </div>

      {showSuccessView && peanutLink ? (
        <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100 min-h-[400px] flex flex-col">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 rounded-2xl pointer-events-none"></div>

          <div className="relative flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="mb-4 relative">
              <div className="w-24 h-16 mx-auto relative">
                <div className="absolute inset-0 border-2 border-amber-600 bg-amber-50 flex items-center justify-center overflow-hidden">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-amber-100 border-2 border-amber-600 origin-top rotate-0"></div>
              </div>
              <div className="mt-2 text-amber-800 font-medium">
                ${selectedAmount} sent successfully!
              </div>
            </div>

            <h2 className="text-2xl font-bold text-amber-900">
              Your Surprise is Ready!
            </h2>

            {/* Only show contact info and send button if contact was provided */}
            {contactValue ? (
              <>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-amber-700">Sending to:</span>
                  <span className="font-medium text-amber-900">{contactValue}</span>
                </div>

                <a
                  href={getShareLink()}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send {contactType === "email" ? "Email" : "SMS"} Now
                </a>
              </>
            ) : (
              <div className="mb-2 text-amber-700">
                Share this link directly with the recipient
              </div>
            )}

            {/* Link display with copy button */}
            <div className="w-full bg-white p-4 rounded-lg border border-amber-200 relative group">
              <div className="text-amber-900 font-mono text-sm break-all">
                {peanutLink}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(peanutLink);
                  alert("Link copied to clipboard!");
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Native Share Button - moved under the link display */}
            {canShare && (
              <button
                onClick={handleShare}
                className="w-full py-3 px-4 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center"
              >
                Share
              </button>
            )}

            {/* View transaction link */}
            <a
              href={`https://optimistic.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-800 text-sm underline"
            >
              View transaction details
            </a>
          </div>

          <div className="mt-8">
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 rounded-lg font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Create Another Surprise
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-[#fff9f0] rounded-2xl shadow-lg p-8 relative border border-amber-100">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0iYSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIuNzUiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50 rounded-2xl pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative mt-8">
            {/* Email/Phone toggle */}
            <div className="flex bg-amber-50/50 rounded-lg p-1 border border-amber-200">
              <button
                type="button"
                onClick={() => setContactType("email")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  contactType === "email"
                    ? "bg-white shadow-sm text-amber-900"
                    : "text-amber-700 hover:text-amber-900"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactType("phone")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  contactType === "phone"
                    ? "bg-white shadow-sm text-amber-900"
                    : "text-amber-700 hover:text-amber-900"
                }`}
              >
                Phone
              </button>
            </div>

            {/* Contact input - simplified optional field */}
            <div>
              <label
                htmlFor={contactType === "email" ? "email" : "phone"}
                className="block text-sm font-medium text-amber-800 mb-2"
              >
                {contactType === "email" ? "Email Address" : "Phone Number"} 
                <span className="text-amber-500 text-xs ml-1">(optional)</span>
              </label>
              <input
                type={contactType === "email" ? "email" : "tel"}
                id={contactType === "email" ? "email" : "phone"}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactType === "email"
                    ? "Enter email address"
                    : "Enter phone number"
                }
                className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white/80 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-colors text-amber-900 placeholder-amber-400"
              />
              <p className="mt-1 text-xs text-amber-600">
                Add a {contactType} to send the surprise link automatically.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmount(amount)}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      selectedAmount === amount
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <SendButton
              linkData={linkData}
              isSubmitting={isSubmitting}
              selectedAmount={selectedAmount}
              onPaymentCompleted={handlePaymentCompleted}
            />

            {loading && !showSuccessView && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                <div className="animate-pulse">
                  <p className="text-amber-800 font-medium">
                    Creating your surprise link...
                  </p>
                  <p className="text-amber-600 text-sm mt-1">
                    This may take a moment. Please wait.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
