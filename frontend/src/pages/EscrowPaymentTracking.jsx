import { useState } from "react";
import { Link, useSearchParams } from "react-router";

export default function EscrowPaymentTracking() {
  const [searchParams] = useSearchParams();
  const price = searchParams.get("price") || "23500";
  const [isCopied, setIsCopied] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  const deliveryPin = "7429";

  const handleCopyPin = () => {
    navigator.clipboard?.writeText?.(deliveryPin);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-2xl px-4 sm:px-6 py-6 pb-20">
        <div className="flex flex-col gap-6 w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/product/ankara-wax"
              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back</span>
            </Link>

            <span className="text-label-sm font-bold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Dual-Protection Escrow Active
            </span>
          </div>

          {/* Amount In Trust Card */}
          <div className="bg-surface-container-lowest p-6 rounded-DEFAULT shadow-xs border border-outline-variant/30 flex flex-col items-center text-center gap-2">
            <span className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
              Total Held in Kiosq Escrow
            </span>
            <span className="text-[36px] sm:text-[42px] font-extrabold text-on-surface tracking-tight">
              ₦{Number(price).toLocaleString()}
            </span>
            <p className="text-body-sm text-on-surface-variant max-w-md">
              Your money is safe in an NDIC-insured trust depository. It will only be disbursed to
              Mama Tola after the 2-step verification.
            </p>
          </div>

          {/* Step 1: 4-Digit Delivery PIN Card */}
          <div className="bg-surface-container-lowest p-6 rounded-DEFAULT shadow-xs border-2 border-primary flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  Delivery PIN Handoff
                </h3>
              </div>
              <span className="text-label-sm bg-surface-container-high px-2.5 py-0.5 rounded-full font-bold text-on-surface">
                Show to Rider
              </span>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              When your dispatch rider arrives at your doorstep with the package, give them this
              4-digit PIN. This proves physical handoff and stops courier fraud.
            </p>

            {/* PIN Code Box */}
            <div className="bg-surface-container p-4 rounded-DEFAULT flex items-center justify-between border border-surface-container-high">
              <div className="flex items-center gap-3">
                <span className="text-[28px] sm:text-[32px] font-mono font-extrabold tracking-widest text-primary">
                  {deliveryPin}
                </span>
              </div>
              <button
                onClick={handleCopyPin}
                className="inline-flex items-center gap-1 bg-surface-container-lowest text-on-surface text-label-sm font-bold px-3 py-1.5 rounded-full border border-outline-variant/50 hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCopied ? "check" : "content_copy"}
                </span>
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Step 2: 24-Hour Inspection Window */}
          <div className="bg-surface-container-lowest p-6 rounded-DEFAULT shadow-xs border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  24-Hour Inspection Window
                </h3>
              </div>
              <span className="text-label-sm bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-bold">
                Auto-Release
              </span>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              Once PIN handoff is confirmed, you have 24 hours to inspect your fabric. If there is
              any issue ("what I ordered vs what I got"), tap <strong>Report an Issue</strong> to
              pause the payout. Otherwise, funds auto-release to the seller.
            </p>

            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant pt-1 font-semibold">
              <span className="material-symbols-outlined text-[18px] text-secondary">timer</span>
              <span>Inspection countdown starts upon PIN validation.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {!deliveryConfirmed ? (
              <button
                onClick={() => setDeliveryConfirmed(true)}
                className="w-full h-13 rounded-full bg-primary text-on-primary text-headline-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                <span>Confirm Delivery &amp; Release Funds</span>
              </button>
            ) : (
              <div className="bg-secondary-container text-on-secondary-container p-4 rounded-DEFAULT flex items-center justify-center gap-2 text-label-md font-bold text-center">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Delivery confirmed! ₦{Number(price).toLocaleString()} transferred to Mama Tola.</span>
              </div>
            )}

            <button
              className="w-full h-12 rounded-full bg-surface-container text-error text-label-md font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
              <span>Report an Issue or Delay</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
