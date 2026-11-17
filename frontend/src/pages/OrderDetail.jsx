import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import { useToast } from "../context/ToastContext";
import { getOrderById, updateOrder } from "../utils/orderStorage";
import KiosqLogo from "../components/KiosqLogo";

export default function OrderDetail() {
  const { orderId } = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    deliveredBy: "me", // "me" | "trusted" | "courier"
    name: "",
    phone: "",
    packedPhoto: null,
  });
  const fileInputRef = useRef(null);

  // Dispute actions state
  const [contestModalOpen, setContestModalOpen] = useState(false);
  const [contestForm, setContestForm] = useState({ note: "", photos: [] });
  const contestFileRef = useRef(null);

  useEffect(() => {
    const found = getOrderById(orderId);
    setOrder(found);
  }, [orderId]);

  if (!order) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">hourglass_empty</span>
          <p className="text-headline-sm font-bold">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Handle Mark as Dispatched
  const handleMarkDispatched = () => {
    let delivererName = "Seller (Direct)";
    if (dispatchForm.deliveredBy === "trusted") {
      delivererName = dispatchForm.name ? `${dispatchForm.name} (Friend/Family)` : "Trusted contact";
    } else if (dispatchForm.deliveredBy === "courier") {
      delivererName = dispatchForm.name ? `${dispatchForm.name} (Courier)` : "Courier service";
    }

    const updatedTimeline = order.timeline.map((step) => {
      if (step.label === "Dispatched") {
        return {
          ...step,
          completed: true,
          time: "Just now",
          note: `Delivered by ${delivererName}${dispatchForm.phone ? ` • ${dispatchForm.phone}` : ""}`,
        };
      }
      return step;
    });

    const updated = updateOrder(order.id, {
      deliveryStatus: "DISPATCHED",
      dispatchedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      deliveredBy: {
        type: dispatchForm.deliveredBy,
        name: delivererName,
        phone: dispatchForm.phone,
      },
      packedItemPhoto: dispatchForm.packedPhoto,
      timeline: updatedTimeline,
    });

    setOrder(updated);
    setIsDispatchModalOpen(false);
    addToast("Order marked as dispatched! Delivery person can now collect the PIN upon arrival.", "success", 10000);
  };

  // Handle Doorstep PIN Confirmation
  const handleVerifyPin = () => {
    if (!pinInput.trim() || pinInput.length !== 4) {
      setPinError("Please enter the complete 4-digit PIN provided by the buyer.");
      addToast("Invalid PIN format. Must be 4 digits.", "error", 8000);
      return;
    }

    if (pinInput.trim() !== order.deliveryPin) {
      setPinError("Incorrect 4-digit PIN! Please ask the buyer to check their Kiosq screen.");
      addToast("PIN does not match buyer's delivery code. Verification failed.", "error", 10000);
      return;
    }

    // Success: advance timeline to PIN verified & start 24h inspection window
    setPinError("");
    const updatedTimeline = order.timeline.map((step) => {
      if (step.label === "Delivered (PIN)") {
        return { ...step, completed: true, time: "Just now", note: "Physical handoff verified with 4-digit PIN" };
      }
      if (step.label === "Inspection window") {
        return { ...step, completed: true, time: "Active now", note: "24-hour buyer inspection countdown started" };
      }
      return step;
    });

    const updated = updateOrder(order.id, {
      deliveryStatus: "PIN_VERIFIED",
      inspectionHoursLeft: 24,
      timeline: updatedTimeline,
    });

    setOrder(updated);
    setPinInput("");
    addToast("🎉 Doorstep PIN verified! Physical handoff confirmed. The 24-hour inspection countdown has started.", "success", 12000);
  };

  // Handle Share Handoff Link to WhatsApp
  const handleShareHandoffLink = () => {
    const handoffUrl = `${window.location.origin}/handoff/${order.id}`;
    const text = `📦 Kiosq Delivery Handoff Link for ${order.itemTitle}\nDelivery Address: ${order.deliveryAddress}\nBuyer: ${order.buyerFullName} (${order.buyerPhone})\n\n👉 Open this link to enter buyer's 4-digit PIN when handing over: ${handoffUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addToast("Handoff link & delivery instructions copied to clipboard! Share directly with your delivery person on WhatsApp.", "success", 10000);
    } else {
      addToast(`Handoff link: ${handoffUrl}`, "info", 10000);
    }
  };

  // Dispute actions (from Requirement 5)
  const handleAcceptRefund = () => {
    const updated = updateOrder(order.id, {
      status: "Refunded",
      dispute: { ...order.dispute, status: "Settled - Refund Approved by Seller" },
    });
    setOrder(updated);
    addToast("Refund accepted. Escrow deposit will be returned to the buyer.", "info", 10000);
  };

  const handleOfferReplacement = () => {
    const updated = updateOrder(order.id, {
      dispute: { ...order.dispute, status: "Replacement In Transit - Tracking Updated" },
    });
    setOrder(updated);
    addToast("Replacement offer recorded. Buyer has been notified on WhatsApp.", "success", 10000);
  };

  const handleContestDispute = () => {
    if (!contestForm.note.trim()) {
      addToast("Please provide a short explanation for your contest.", "error", 8000);
      return;
    }
    const updated = updateOrder(order.id, {
      dispute: {
        ...order.dispute,
        status: "In review by Kiosq",
        sellerContestNote: contestForm.note,
        sellerEvidencePhotos: contestForm.photos,
      },
    });
    setOrder(updated);
    setContestModalOpen(false);
    addToast("Dispute evidence submitted! Case is now In review by Kiosq arbitration team.", "info", 12000);
  };

  const isDispatched = order.timeline.find((t) => t.label === "Dispatched")?.completed;
  const isPinVerified = order.timeline.find((t) => t.label === "Delivered (PIN)")?.completed;
  const isReleased = order.timeline.find((t) => t.label === "Released")?.completed;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-3xl px-4 sm:px-6 py-6 pb-24">
        <div className="flex flex-col gap-6 w-full">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Orders</span>
              </Link>
              <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
                <KiosqLogo className="h-10 sm:h-12 w-auto" />
              </Link>
            </div>

            <span className="font-mono text-xs font-bold bg-surface-container px-3 py-1 rounded-full text-on-surface">
              {order.orderReference}
            </span>
          </div>

          {/* Dispute Warning Banner (if disputed) */}
          {order.dispute && (
            <div className="bg-error/10 border-2 border-error rounded-DEFAULT p-4 flex flex-col gap-3 animate-fade-in shadow-[2px_2px_0px_#ba1a1a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[22px]">gpp_maybe</span>
                  <span className="text-headline-sm font-bold text-error">
                    Payout Paused: Issue Reported by Buyer
                  </span>
                </div>
                <span className="text-xs font-bold bg-error text-white px-2.5 py-0.5 rounded-full">
                  {order.dispute.status}
                </span>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-md border border-error/30 text-body-sm flex flex-col gap-1.5">
                <span className="font-bold text-on-surface">
                  Reason: <span className="capitalize">{order.dispute.reason.replace(/-/g, " ")}</span>
                </span>
                {order.dispute.note && (
                  <p className="text-on-surface-variant">"{order.dispute.note}"</p>
                )}
                {order.dispute.photos && order.dispute.photos.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    {order.dispute.photos.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt="Evidence"
                        className="w-16 h-16 object-cover rounded border border-outline-variant"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Three Seller Actions */}
              {order.dispute.status !== "In review by Kiosq" && order.status !== "Refunded" && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleAcceptRefund}
                    className="px-4 py-2 rounded-full bg-error text-white text-label-sm font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
                  >
                    Accept and refund
                  </button>

                  <button
                    onClick={handleOfferReplacement}
                    className="px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
                  >
                    Offer replacement
                  </button>

                  <button
                    onClick={() => setContestModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-surface-container-lowest border-2 border-primary text-on-surface text-label-sm font-bold hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Contest with evidence
                  </button>
                </div>
              )}

              {order.dispute.status === "In review by Kiosq" && (
                <div className="flex items-center gap-2 text-label-sm font-bold text-primary bg-primary/10 p-2.5 rounded">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>In review by Kiosq arbitration team. You will be updated within 6 hours.</span>
                </div>
              )}
            </div>
          )}

          {/* Order Header Summary */}
          <div className="bg-surface-container-lowest p-5 rounded-DEFAULT border-2 border-primary shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={order.imageUrl}
                alt={order.itemTitle}
                className="w-18 h-18 rounded-md object-cover border border-outline-variant shrink-0 bg-surface-container"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-headline-md font-extrabold text-on-surface truncate">
                  {order.itemTitle}
                </span>
                <span className="text-body-sm text-on-surface-variant font-medium mt-0.5">
                  Buyer: <strong className="text-on-surface">{order.buyerFullName}</strong> ({order.buyerPhone})
                </span>
                <span className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                  <span className="material-symbols-outlined text-[15px] shrink-0">location_on</span>
                  <span className="truncate">{order.deliveryAddress}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container-high">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                Escrow Amount
              </span>
              <span className="text-[28px] font-extrabold text-on-surface">
                ₦{order.amount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-secondary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Secured in Escrow
              </span>
            </div>
          </div>

          {/* Status Timeline Card */}
          <div className="bg-surface-container-lowest p-5 rounded-DEFAULT border-2 border-primary/20 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-label-lg font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">timeline</span>
                Order Status Timeline
              </h2>
              <span className="text-label-sm font-mono text-on-surface-variant">
                5-Stage Escrow Protection
              </span>
            </div>

            <div className="flex flex-col gap-4 pl-2 relative">
              {order.timeline.map((step, idx) => {
                const isCurrent = step.completed && (!order.timeline[idx + 1] || !order.timeline[idx + 1].completed);
                return (
                  <div key={step.label} className="flex items-start gap-3.5 relative">
                    {/* Connecting vertical line */}
                    {idx < order.timeline.length - 1 && (
                      <div
                        className={`absolute left-[13px] top-[26px] bottom-[-16px] w-[2px] ${
                          order.timeline[idx + 1].completed ? "bg-primary" : "bg-outline-variant/40"
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        step.completed
                          ? "bg-primary text-on-primary font-bold shadow-xs"
                          : "bg-surface-container text-on-surface-variant border border-outline-variant"
                      }`}
                    >
                      {step.completed ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-label-md font-bold ${step.completed ? "text-on-surface" : "text-on-surface-variant"}`}>
                          {step.label}
                        </span>
                        {step.time && (
                          <span className="text-xs text-on-surface-variant">
                            • {step.time}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.2 rounded-full uppercase">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <span className="text-body-sm text-on-surface-variant mt-0.5">
                        {step.note}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Action 1: Mark as Dispatched (if not dispatched) */}
          {!isDispatched && (
            <div className="bg-surface-container-lowest p-5 rounded-DEFAULT border-2 border-primary shadow-[2px_2px_0px_#000000] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-headline-sm font-bold text-on-surface">Step 1: Dispatch Package</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Assign a delivery person (yourself, a friend/relative, or courier service).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-md font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  Mark as Dispatched
                </button>
              </div>
            </div>
          )}

          {/* Step Action 2: Confirm Handoff with 4-Digit PIN */}
          {isDispatched && !isPinVerified && (
            <div className="bg-surface-container-lowest p-5 rounded-DEFAULT border-2 border-primary shadow-[3px_3px_0px_#000000] flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h3 className="text-headline-sm font-bold text-on-surface">
                      Confirm Doorstep Delivery PIN
                    </h3>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    When the delivery person reaches the buyer, ask the buyer for their 4-digit secret PIN to confirm physical handoff.
                  </p>
                </div>

                <span className="text-label-sm font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                  Awaiting Buyer PIN
                </span>
              </div>

              {/* PIN Input Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-Digit PIN"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ""));
                    setPinError("");
                  }}
                  className="w-full sm:w-56 h-12 px-4 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-center font-mono text-[24px] font-black tracking-widest text-primary focus:outline-primary"
                />

                <button
                  type="button"
                  onClick={handleVerifyPin}
                  className="w-full sm:w-auto px-6 h-12 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Confirm Handoff</span>
                </button>
              </div>

              {pinError && (
                <div className="flex items-center gap-1.5 text-xs text-error font-bold">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{pinError}</span>
                </div>
              )}
            </div>
          )}

          {/* Shareable Handoff Link Card */}
          <div className="bg-surface-container-lowest p-5 rounded-DEFAULT border-2 border-primary/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-label-md font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#25D366]">share</span>
                Delivery Person Handoff Link
              </span>
              <p className="text-body-sm text-on-surface-variant max-w-md">
                Sending a friend, brother, or courier? Share this minimal public link to WhatsApp so they can verify the buyer's PIN without logging into your account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleShareHandoffLink}
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-label-sm font-bold hover:bg-[#1ebd59] transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Copy Link for WhatsApp</span>
            </button>
          </div>
        </div>
      </main>

      {/* Mark As Dispatched Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-DEFAULT border-2 border-primary shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <h3 className="text-headline-sm font-bold text-on-surface">Mark Order as Dispatched</h3>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Delivery Person Options */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase">
                  Delivered By:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "me", label: "Me (Seller)" },
                    { id: "trusted", label: "Someone I trust" },
                    { id: "courier", label: "Courier" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDispatchForm((f) => ({ ...f, deliveredBy: option.id }))}
                      className={`p-2.5 rounded-DEFAULT text-label-sm font-bold border text-center transition-all cursor-pointer ${
                        dispatchForm.deliveredBy === option.id
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Name and Phone for friend/courier */}
              {dispatchForm.deliveredBy !== "me" && (
                <div className="grid grid-cols-2 gap-2.5 animate-fade-in">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant">Name (Optional)</label>
                    <input
                      type="text"
                      placeholder={dispatchForm.deliveredBy === "courier" ? "e.g. Gokada" : "e.g. Segun"}
                      value={dispatchForm.name}
                      onChange={(e) => setDispatchForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full h-10 px-3 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-body-sm font-bold text-on-surface"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant">Phone (Optional)</label>
                    <input
                      type="text"
                      placeholder="080..."
                      value={dispatchForm.phone}
                      onChange={(e) => setDispatchForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full h-10 px-3 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-body-sm font-bold text-on-surface"
                    />
                  </div>
                </div>
              )}

              {/* Optional Packed-Item Photo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase flex items-center justify-between">
                  <span>Packed Item Photo (Optional)</span>
                  <span className="text-[11px] text-on-surface-variant normal-case">Proof of package condition</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setDispatchForm((f) => ({ ...f, packedPhoto: url }));
                    }
                  }}
                  className="hidden"
                />

                {dispatchForm.packedPhoto ? (
                  <div className="relative w-full h-36 rounded-DEFAULT overflow-hidden border border-outline-variant">
                    <img src={dispatchForm.packedPhoto} alt="Packed Item" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setDispatchForm((f) => ({ ...f, packedPhoto: null }))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary/80 text-on-primary flex items-center justify-center text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-DEFAULT border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-container cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                    <span className="text-label-sm font-bold">Snap Packed Package or Upload</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 h-11 rounded-full bg-surface-container text-on-surface text-label-md font-bold hover:bg-surface-container-high cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkDispatched}
                className="px-6 h-11 rounded-full bg-primary text-on-primary text-label-md font-bold hover:bg-neutral-800 cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contest Dispute Modal */}
      {contestModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-DEFAULT border-2 border-primary shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <h3 className="text-headline-sm font-bold text-on-surface">Contest Buyer Dispute</h3>
              <button
                onClick={() => setContestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface uppercase">
                  Your Explanation / Defense
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why the item was correctly dispatched as described..."
                  value={contestForm.note}
                  onChange={(e) => setContestForm((f) => ({ ...f, note: e.target.value }))}
                  className="w-full p-2.5 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-body-sm font-medium text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface uppercase">
                  Add Evidence Photos (Packaging / Video)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={contestFileRef}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const urls = files.map((f) => URL.createObjectURL(f));
                    setContestForm((prev) => ({ ...prev, photos: [...prev.photos, ...urls].slice(0, 3) }));
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => contestFileRef.current?.click()}
                  className="w-full h-18 rounded-DEFAULT border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                  <span className="text-label-sm font-bold">Upload Seller Evidence ({contestForm.photos.length}/3)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setContestModalOpen(false)}
                className="px-4 h-11 rounded-full bg-surface-container text-on-surface text-label-md font-bold hover:bg-surface-container-high cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContestDispute}
                className="px-6 h-11 rounded-full bg-primary text-on-primary text-label-md font-bold hover:bg-neutral-800 cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                Submit Contest Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
