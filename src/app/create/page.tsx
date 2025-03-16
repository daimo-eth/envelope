"use client";

import { useState, useEffect } from "react";
import { DaimoPayButton, DaimoPayCompletedEvent } from "@daimo/pay";
import { createLinkCall, getLinkFromDeposit } from "@/chain/link";
import { Hex } from "viem";
import { OP_CHAIN_ID, OP_DAI_ADDRESS, LinkCall } from "@/chain/link";

export default function CreatePage() {
  const [txHash, setTxHash] = useState<Hex>();
  const [linkData, setLinkData] = useState<LinkCall>();
  const [peanutLink, setPeanutLink] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Generate link data only once when component mount
  const usd = 0.42;
  useEffect(() => {
    createLinkCall({ usd })
      .then((data) => setLinkData(data))
      .catch(console.error);
  }, []);

  const handlePaymentCompleted = async (e: DaimoPayCompletedEvent) => {
    console.log("payment completed:", e);
    const hash = e.txHash as Hex;
    setTxHash(hash);
    
    if (linkData) {
      setLoading(true);
      try {
        const link = await getLinkFromDeposit({
          txHash: hash,
          password: linkData.password
        });
        setPeanutLink(link);
      } catch (error) {
        console.error("failed to generate peanut link:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (linkData == null) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h1>send</h1>

      <DaimoPayButton
        appId="pay-demo"
        toChain={OP_CHAIN_ID}
        toToken={OP_DAI_ADDRESS}
        toUnits={usd.toFixed(2)}
        toAddress={linkData.address}
        toCallData={linkData.calldata}
        onPaymentCompleted={handlePaymentCompleted}
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
          
          {loading && <p>generating peanut link...</p>}
          
          {peanutLink && (
            <div>
              <p>claim your funds:</p>
              <a 
                href={peanutLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {peanutLink}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
