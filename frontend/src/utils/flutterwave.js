/**
 * Flutterwave Checkout Integration for Kiosq Escrow
 * Uses Flutterwave Inline v3 in test mode.
 */

const DEFAULT_FLUTTERWAVE_TEST_KEY = "FLWPUBK_TEST-512c125d806a6669931bfa2ebdfa91b2-X";

export function initiateFlutterwavePayment({
  amount,
  itemTitle = "Kiosq Order",
  buyerName = "Verified Buyer",
  buyerEmail = "buyer@usekiosq.shop",
  buyerPhone = "08012345678",
  onSuccess,
  onClose,
}) {
  const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || DEFAULT_FLUTTERWAVE_TEST_KEY;
  const txRef = `KIOSQ-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (typeof window !== "undefined" && typeof window.FlutterwaveCheckout === "function") {
    try {
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: txRef,
        amount: Number(amount),
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        customer: {
          email: buyerEmail || "customer@usekiosq.shop",
          phone_number: buyerPhone || "08012345678",
          name: buyerName || "Verified Buyer",
        },
        customizations: {
          title: "Kiosq SafeEscrow",
          description: `Escrow payment for ${itemTitle} (Held safe until delivery PIN verified)`,
          logo: "https://usekiosq.shop/favicon.png",
        },
        callback: function (response) {
          if (onSuccess) {
            onSuccess({
              status: response.status || "successful",
              tx_ref: response.tx_ref || txRef,
              transaction_id: response.transaction_id || `FLW-${Date.now()}`,
              flw_ref: response.flw_ref || "",
            });
          }
        },
        onclose: function () {
          if (onClose) onClose();
        },
      });
      return;
    } catch (err) {
      console.warn("FlutterwaveCheckout invocation failed, falling back to instant test mode:", err);
    }
  }

  // Fallback test mode confirmation if script is unavailable or blocked by ad-blocker
  const confirmTest = window.confirm(
    `[Flutterwave Test Sandbox]\nSimulate successful payment of ₦${Number(amount).toLocaleString()} into Kiosq Escrow?`
  );
  if (confirmTest) {
    if (onSuccess) {
      onSuccess({
        status: "successful",
        tx_ref: txRef,
        transaction_id: `FLW-TEST-${Date.now()}`,
      });
    }
  } else if (onClose) {
    onClose();
  }
}
