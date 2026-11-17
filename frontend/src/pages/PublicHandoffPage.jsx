import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useToast } from "../context/ToastContext";
import { getOrderById, updateOrder } from "../utils/orderStorage";

export default function PublicHandoffPage() {
  const { orderId } = useParams();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const found = getOrderById(orderId);
    setOrder(found);
    if (found && (found.deliveryStatus === "PIN_VERIFIED" || found.deliveryStatus === "DELIVERED_AND_RELEASED")) {
      setIsSuccess(true);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">search</span>
          <p className="text-headline-sm font-bold">Order not found.</p>
        </div>
      </div>
    );
  }

  const handleConfirmHandoff = () => {
    if (!pin.trim() || pin.length !== 4) {
      setError("Please enter the complete 4-digit PIN.");
      addToast("Enter 4-digit delivery PIN.", "error", 6000);
      return;
    }

    if (pin.trim() !== order.deliveryPin) {
      setError("Incorrect PIN. Please ask the buyer to check their Kiosq screen.");
      addToast("Invalid PIN. Physical handoff cannot be verified.", "error", 10000);
      return;
    }

    // Advance order
    const updatedTimeline = order.timeline.map((step) => {
      if (step.label === "Delivered (PIN)") {
        return { ...step, completed: true, time: "Just now", note: "Verified by delivery person at doorstep" };
      }
      if (step.label === "Inspection window") {
        return { ...step, completed: true, time: "Active now", note: "24-hour buyer inspection started" };
      }
      return step;
    });

    updateOrder(order.id, {
      deliveryStatus: "PIN_VERIFIED",
      inspectionHoursLeft: 24,
      timeline: updatedTimeline,
    });

    setIsSuccess(true);
    setError("");
    addToast("🎉 Doorstep PIN verified! Delivery recorded successfully.", "success", 12000);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-DEFAULT border-2 border-primary shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
            <span className="text-headline-sm font-bold text-on-surface">Kiosq Delivery Handoff</span>
          </div>
          <span className="text-xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface">
            {order.orderReference}
          </span>
        </div>

        {/* Order Info Strip */}
        <div className="flex items-center gap-3 bg-surface-container-low p-3.5 rounded-DEFAULT border border-outline-variant/30">
          <img
            src={order.imageUrl}
            alt={order.itemTitle}
            className="w-14 h-14 rounded-md object-cover border border-outline-variant shrink-0 bg-surface-container"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-label-md font-bold text-on-surface truncate">
              {order.itemTitle}
            </span>
            <span className="text-body-sm font-extrabold text-on-surface mt-0.5">
              ₦{order.amount.toLocaleString()} (Paid in Escrow)
            </span>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="flex flex-col gap-1.5 text-body-sm">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-medium">Buyer Name:</span>
            <span className="font-bold text-on-surface">{order.buyerFullName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-medium">Buyer Phone:</span>
            <a href={`tel:${order.buyerPhone}`} className="font-bold text-primary underline">
              {order.buyerPhone}
            </a>
          </div>
          <div className="flex flex-col gap-0.5 mt-1 pt-2 border-t border-surface-container-high">
            <span className="text-on-surface-variant font-medium text-xs">Delivery Address:</span>
            <span className="font-bold text-on-surface">{order.deliveryAddress}</span>
          </div>
        </div>

        {/* Handoff Form or Success State */}
        {!isSuccess ? (
          <div className="flex flex-col gap-3 pt-2 border-t border-surface-container-high">
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-bold text-on-surface uppercase">
                Ask Buyer for 4-Digit Delivery PIN:
              </label>
              <p className="text-xs text-on-surface-variant">
                The buyer displays this 4-digit code on their Kiosq screen to authorize physical package handoff.
              </p>
            </div>

            <input
              type="text"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="w-full h-14 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-center font-mono text-[32px] font-black tracking-widest text-primary focus:outline-primary"
            />

            {error && (
              <span className="text-xs text-error font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">error</span>
                {error}
              </span>
            )}

            <button
              type="button"
              onClick={handleConfirmHandoff}
              className="w-full h-12 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] mt-1"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Confirm Doorstep Handoff</span>
            </button>
          </div>
        ) : (
          <div className="bg-secondary-container text-on-secondary-container p-5 rounded-DEFAULT flex flex-col items-center text-center gap-2 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">check</span>
            </div>
            <span className="text-headline-sm font-extrabold">Delivery Confirmed!</span>
            <p className="text-body-sm text-on-secondary-container/90">
              4-digit PIN validated. The 24-hour inspection countdown has started and seller has been notified.
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <span className="text-[11px] text-on-surface-variant">
            Powered by Kiosq • Trusted Social Commerce Escrow
          </span>
        </div>
      </main>
    </div>
  );
}
