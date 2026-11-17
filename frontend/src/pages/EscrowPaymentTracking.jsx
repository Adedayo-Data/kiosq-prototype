import { useState, useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useToast } from "../context/ToastContext";
import { getOrderById, updateOrder } from "../utils/orderStorage";

export default function EscrowPaymentTracking() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  // Dispute Report Modal State (Requirement 5)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStep, setReportStep] = useState(1); // 1: Reason, 2: Photos & Note, 3: Confirmation
  const [selectedReason, setSelectedReason] = useState("");
  const [disputeNote, setDisputeNote] = useState("");
  const [disputePhotos, setDisputePhotos] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const found = getOrderById(orderId || "ORD-4821");
    setOrder(found);
    if (found?.deliveryStatus === "DELIVERED_AND_RELEASED") {
      setDeliveryConfirmed(true);
    }
  }, [orderId]);

  const deliveryPin = order?.deliveryPin || "7429";
  const price = order?.amount || searchParams.get("price") || 28000;

  const handleCopyPin = () => {
    navigator.clipboard?.writeText?.(deliveryPin);
    setIsCopied(true);
    addToast("4-digit delivery PIN copied!", "info", 5000);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmDelivery = () => {
    setDeliveryConfirmed(true);
    if (order) {
      const updatedTimeline = order.timeline.map((step) => {
        if (step.label === "Delivered (PIN)" || step.label === "Released") {
          return { ...step, completed: true, time: "Just now", note: "Confirmed by buyer" };
        }
        return step;
      });
      updateOrder(order.id, {
        status: "Completed",
        deliveryStatus: "DELIVERED_AND_RELEASED",
        timeline: updatedTimeline,
      });
    }
    addToast("🎉 Delivery confirmed! Funds released to seller settlement account.", "success", 10000);
  };

  // Submit Dispute (Requirement 5 Step 3)
  const handleSubmitDispute = () => {
    if (!selectedReason) {
      addToast("Please select a reason for reporting an issue.", "error", 8000);
      return;
    }

    const disputeData = {
      reason: selectedReason,
      note: disputeNote,
      photos: disputePhotos,
      status: "Reported",
      reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (order) {
      const updated = updateOrder(order.id, {
        status: "Disputed",
        dispute: disputeData,
      });
      setOrder(updated);
    }

    setReportStep(3);
    addToast("Payout paused! Your dispute has been submitted to Kiosq Escrow Protection.", "info", 12000);
  };

  const reasons = [
    {
      id: "not-delivered-or-delayed",
      title: "Not delivered or delayed",
      desc: "Delivery person has not arrived or delivery window has passed",
      icon: "schedule",
    },
    {
      id: "not-as-described",
      title: "Not as described",
      desc: "Color, fabric quality, pattern, or size differs from what was shown",
      icon: "inventory_2",
    },
    {
      id: "damaged",
      title: "Damaged",
      desc: "Package or item arrived torn, stained, crushed, or broken",
      icon: "broken_image",
    },
    {
      id: "something-else",
      title: "Something else",
      desc: "Wrong item delivered, seller unresponsive, or other concern",
      icon: "help_outline",
    },
  ];

  // 4-stage Dispute Tracker for Requirement 5
  const disputeStages = [
    { label: "Reported", active: true },
    { label: "Seller responds", active: order?.dispute?.status?.includes("Replacement") || order?.dispute?.status?.includes("review") },
    { label: "Resolution", active: order?.dispute?.status?.includes("review") || order?.status === "Refunded" },
    { label: "Settled", active: order?.status === "Refunded" || order?.dispute?.status?.includes("Settled") },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-2xl px-4 sm:px-6 py-6 pb-24">
        <div className="flex flex-col gap-6 w-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
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

          {/* Payout Paused Banner & Tracker if Disputed (Requirement 5) */}
          {order?.dispute && (
            <div className="bg-error/10 border-2 border-error rounded-DEFAULT p-5 flex flex-col gap-4 animate-fade-in shadow-[3px_3px_0px_#ba1a1a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[24px]">gpp_maybe</span>
                  <div className="flex flex-col">
                    <span className="text-headline-sm font-extrabold text-error">
                      Payout Paused
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Seller payout is safely frozen while this issue is being resolved.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold bg-error text-white px-2.5 py-1 rounded-full uppercase">
                  {order.dispute.status}
                </span>
              </div>

              {/* 4-Step Tracker: Reported -> Seller responds -> Resolution -> Settled */}
              <div className="bg-surface-container-lowest p-3.5 rounded-DEFAULT border border-error/30 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Dispute Resolution Progress
                </span>

                <div className="grid grid-cols-4 gap-1 text-center items-center">
                  {disputeStages.map((stage, idx) => (
                    <div key={stage.label} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          stage.active
                            ? "bg-error text-white shadow-xs"
                            : "bg-surface-container text-on-surface-variant border border-outline-variant"
                        }`}
                      >
                        {stage.active ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold ${stage.active ? "text-error" : "text-on-surface-variant"}`}>
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Amount In Trust Card */}
          <div className="bg-surface-container-lowest p-6 rounded-DEFAULT shadow-[2px_2px_0px_#000000] border-2 border-primary flex flex-col items-center text-center gap-2">
            <span className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
              Total Held in Kiosq Escrow
            </span>
            <span className="text-[36px] sm:text-[42px] font-extrabold text-on-surface tracking-tight">
              ₦{Number(price).toLocaleString()}
            </span>
            <p className="text-body-sm text-on-surface-variant max-w-md">
              Your money is held in escrow until you confirm delivery. It will only be disbursed to
              Mama Tola after physical handoff and verification.
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
                Show to Delivery Person
              </span>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              When your delivery person arrives at your doorstep with the package, give them this
              4-digit PIN. This proves physical handoff and stops delivery fraud.
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
              Once PIN handoff is confirmed, you have 24 hours to inspect your item. If there is
              any issue ("what I ordered vs what I got"), tap <strong>Report an Issue</strong> below to
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
                onClick={handleConfirmDelivery}
                className="w-full h-13 rounded-full bg-primary text-on-primary text-headline-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
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

            {!order?.dispute && (
              <button
                onClick={() => {
                  setReportStep(1);
                  setIsReportModalOpen(true);
                }}
                className="w-full h-12 rounded-full bg-surface-container text-error text-label-md font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                <span>Report an Issue or Delay</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* 3-Step Report an Issue Modal (Requirement 5) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-DEFAULT border-2 border-primary shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Steps Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[22px]">gpp_maybe</span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  {reportStep === 1 && "Step 1: Choose a Reason"}
                  {reportStep === 2 && "Step 2: Add Evidence"}
                  {reportStep === 3 && "Step 3: Issue Reported"}
                </h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Step 1: Choose Reason (Large Cards) */}
            {reportStep === 1 && (
              <div className="flex flex-col gap-3">
                <p className="text-body-sm text-on-surface-variant">
                  Select what went wrong with your order. Payout will be paused immediately while we resolve it.
                </p>

                <div className="flex flex-col gap-2.5">
                  {reasons.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReason(r.id)}
                      className={`p-3.5 rounded-DEFAULT border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        selectedReason === r.id
                          ? "border-primary bg-surface-container-low shadow-[2px_2px_0px_#000000]"
                          : "border-outline-variant/40 bg-surface-container-lowest hover:border-primary/50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] text-primary shrink-0 mt-0.5">
                        {r.icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-label-lg font-bold text-on-surface">
                          {r.title}
                        </span>
                        <span className="text-body-sm text-on-surface-variant text-xs mt-0.5">
                          {r.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!selectedReason}
                    onClick={() => setReportStep(2)}
                    className="px-6 h-11 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center gap-1.5 hover:bg-neutral-800 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    <span>Continue to Step 2</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Add Photos (1-3) & Short Note & Return Rules */}
            {reportStep === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm font-bold text-on-surface uppercase flex items-center justify-between">
                    <span>Evidence Photos ({disputePhotos.length}/3)</span>
                    <span className="text-xs text-on-surface-variant normal-case">Camera or gallery</span>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    ref={fileInputRef}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const urls = files.map((f) => URL.createObjectURL(f));
                      setDisputePhotos((prev) => [...prev, ...urls].slice(0, 3));
                    }}
                    className="hidden"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    {disputePhotos.map((src, idx) => (
                      <div key={idx} className="relative h-24 rounded-DEFAULT overflow-hidden border border-outline-variant">
                        <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setDisputePhotos((p) => p.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary/80 text-white flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {disputePhotos.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 rounded-DEFAULT border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-container cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
                        <span className="text-[11px] font-bold">Add Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-bold text-on-surface uppercase">
                    Optional Short Note
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the defect, color mismatch, or packaging damage..."
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    className="w-full p-2.5 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-body-sm text-on-surface focus:outline-primary"
                  />
                </div>

                {/* Return Rules Notice (Strict Requirement) */}
                <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-DEFAULT flex items-start gap-2.5 text-amber-950">
                  <span className="material-symbols-outlined text-amber-800 text-[20px] shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="flex flex-col text-xs leading-relaxed font-semibold">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
                      Return Rules:
                    </span>
                    <span>Buyer pays return transport; item must return unbroken and in original condition.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => setReportStep(1)}
                    className="px-4 h-11 rounded-full bg-surface-container text-on-surface text-label-md font-bold hover:bg-surface-container-high cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitDispute}
                    className="px-6 h-11 rounded-full bg-error text-white text-label-md font-bold flex items-center gap-1.5 hover:bg-red-700 cursor-pointer shadow-[2px_2px_0px_#ba1a1a]"
                  >
                    <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                    <span>Submit &amp; Pause Payout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {reportStep === 3 && (
              <div className="flex flex-col items-center text-center gap-3 py-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-error/15 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">shield</span>
                </div>
                <h4 className="text-headline-md font-extrabold text-on-surface">
                  Payout Successfully Paused
                </h4>
                <p className="text-body-sm text-on-surface-variant max-w-sm">
                  We have locked the ₦{Number(price).toLocaleString()} escrow deposit. The seller has been notified with your evidence and has 24 hours to respond.
                </p>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="mt-2 w-full h-11 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Return to Escrow Screen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
