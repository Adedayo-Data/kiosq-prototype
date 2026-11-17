import { useState, useMemo } from "react";
import { useToast } from "../context/ToastContext";

/**
 * ShareModal handles single and bulk product sharing to WhatsApp Status and social channels.
 */
export default function ShareModal({ isOpen, onClose, items = [], businessName = "My Kiosq" }) {
  const { addToast } = useToast();
  const [copiedType, setCopiedType] = useState(null);

  // Generate WhatsApp-ready caption
  const defaultText = useMemo(() => {
    if (!items || items.length === 0) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    if (items.length === 1) {
      const item = items[0];
      const productUrl = `${origin}/product/${item.slug || item.id}`;
      const caption = item.whatsappCaption
        ? item.whatsappCaption.replace(/👉[\s\S]*$/, "").trim()
        : `Authentic ${item.name} available in stock!`;

      return `🛍️ *${item.name}*\n💰 *Price:* ${item.price}\n\n${caption}\n\n👉 *Order or Haggle Safely:*\n${productUrl}\n\n🔒 *Protected by Kiosq SafeEscrow • Doorstep Delivery*`;
    }

    // Bulk Share format (Multiple items)
    const itemsList = items
      .map((item, idx) => {
        const productUrl = `${origin}/product/${item.slug || item.id}`;
        return `${idx + 1}️⃣ *${item.name}* — ${item.price}\n   👉 Buy/Haggle: ${productUrl}`;
      })
      .join("\n\n");

    return `🔥 *New Arrivals from ${businessName}!* 🔥\n\n${itemsList}\n\n🔒 *All orders protected by Kiosq SafeEscrow.*\nPay safely • 24h inspection window • Fast delivery!`;
  }, [items, businessName]);

  const [customText, setCustomText] = useState(defaultText);

  // Sync customText when items change
  useMemo(() => {
    setCustomText(defaultText);
  }, [defaultText]);

  if (!isOpen || !items || items.length === 0) return null;

  // Handle WhatsApp launch
  const handleShareToWhatsApp = () => {
    const textToSend = customText.trim() || defaultText;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textToSend)}`;
    window.open(whatsappUrl, "_blank");

    addToast(
      items.length === 1
        ? `Opening WhatsApp! Select "My Status" or a chat to share "${items[0].name}".`
        : `Opening WhatsApp! Select "My Status" to post ${items.length} products.`,
      "success",
      10000
    );
    onClose();
  };

  // Handle Copy Caption
  const handleCopyCaption = () => {
    const textToCopy = customText.trim() || defaultText;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedType("caption");
      addToast("WhatsApp post copied to clipboard! Paste directly to your Status or chats.", "success", 8000);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Handle Copy Links Only
  const handleCopyLinksOnly = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const links = items.map((i) => `${i.name}: ${origin}/product/${i.slug || i.id}`).join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(links);
      setCopiedType("links");
      addToast(
        items.length === 1 ? "Product checkout link copied!" : `Copied ${items.length} product links to clipboard!`,
        "info",
        8000
      );
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surface-container-lowest border-2 border-primary shadow-[6px_6px_0px_#000000] rounded-DEFAULT p-5 sm:p-6 max-w-lg w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-extrabold text-on-surface">
                {items.length === 1 ? "Share to WhatsApp" : `Bulk Share (${items.length} Items)`}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Post directly to your WhatsApp Status or DM customers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Selected Products Thumbnails Strip */}
        <div className="flex flex-col gap-1.5">
          <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
            {items.length === 1 ? "Item to Share" : `Selected Items (${items.length})`}
          </span>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-surface-container p-2 rounded-DEFAULT border border-surface-container-high shrink-0 max-w-[200px]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded object-cover border border-outline-variant shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-on-surface truncate">{item.name}</span>
                  <span className="text-[11px] font-extrabold text-primary">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caption Preview & Edit */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
              WhatsApp Post Preview
            </label>
            <span className="text-xs text-on-surface-variant">Editable</span>
          </div>
          <textarea
            rows={items.length > 1 ? 6 : 4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full p-3 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
            placeholder="Type your WhatsApp post caption here..."
          />
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Main WhatsApp Button */}
          <button
            type="button"
            onClick={handleShareToWhatsApp}
            className="w-full h-12 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-label-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Share to WhatsApp Status</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyCaption}
              className="h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedType === "caption" ? "check" : "content_copy"}
              </span>
              <span>{copiedType === "caption" ? "Copied!" : "Copy Full Post"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLinksOnly}
              className="h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedType === "links" ? "check" : "link"}
              </span>
              <span>{copiedType === "links" ? "Copied!" : items.length > 1 ? "Copy All Links" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
