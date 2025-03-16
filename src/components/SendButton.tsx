import { DaimoPayButton, DaimoPayCompletedEvent } from "@daimo/pay";
import { OP_CHAIN_ID, OP_DAI_ADDRESS, LinkCall } from "@/chain/link";

interface SendButtonProps {
  linkData: LinkCall | undefined;
  isSubmitting: boolean;
  selectedAmount: number;
  onPaymentCompleted: (e: DaimoPayCompletedEvent) => void;
}

export function SendButton({
  linkData,
  isSubmitting,
  selectedAmount,
  onPaymentCompleted,
}: SendButtonProps) {
  if (!linkData) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 rounded-lg font-medium bg-amber-300 text-white opacity-70 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <div className="relative">
      <DaimoPayButton.Custom
        appId="pay-demo"
        toChain={OP_CHAIN_ID}
        toToken={OP_DAI_ADDRESS}
        toUnits={selectedAmount.toFixed(2)}
        toAddress={linkData.address}
        toCallData={linkData.calldata}
        onPaymentCompleted={onPaymentCompleted}
      >
        {({ show }) => (
          <button
            type="button"
            onClick={() => {
              console.log("show");
              show();
            }}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-500 relative overflow-hidden 
              ${isSubmitting 
                ? 'bg-amber-100 text-transparent transform scale-95' 
                : 'bg-amber-600 text-white hover:bg-amber-700'}`}
          >
            Send surprise
          </button>
        )}
      </DaimoPayButton.Custom>
    </div>
  );
} 