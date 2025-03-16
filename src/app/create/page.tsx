"use client";

import { useState, useEffect } from "react";
import { DaimoPayButton } from "@daimo/pay";
import { createLinkCall } from "@/chain/link";
import { Hex } from "viem";
import { OP_CHAIN_ID, OP_DAI_ADDRESS, LinkCall } from "@/chain/link";

export default function CreatePage() {
  const [txHash, setTxHash] = useState<Hex>();
  const [linkData, setLinkData] = useState<LinkCall>();

  // Generate link data only once when component mounts
  useEffect(() => {
    createLinkCall({ usd: 10 })
      .then((data) => setLinkData(data))
      .catch(console.error);
  }, []);

  if (linkData == null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>send $10</h1>

      <DaimoPayButton
        appId="pay-demo"
        toChain={OP_CHAIN_ID}
        toToken={OP_DAI_ADDRESS}
        toUnits="10.00"
        toAddress={linkData.address}
        toCallData={linkData.calldata}
        onPaymentCompleted={(e) => {
          console.log("payment completed:", e);
          setTxHash(e.txHash as Hex);
        }}
      />

      {txHash && (
        <div style={{ marginTop: "20px" }}>
          <p>transaction completed!</p>
          <a
            href={`https://optimistic.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            view transaction: {txHash.slice(0, 10)}...
          </a>

          <p>password: {linkData.password}</p>
        </div>
      )}
    </div>
  );
}
