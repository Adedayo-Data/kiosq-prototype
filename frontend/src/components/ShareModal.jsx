import { useState, useMemo, useEffect } from "react";
import { useToast } from "../context/ToastContext";

/**
 * Helper to fetch an image URL and convert to a File object for the native Web Share API
 */
async function fetchImageFile(imageUrl, fileName = "product.jpg") {
  try {
    const res = await fetch(imageUrl, { mode: "cors" });
    if (!res.ok) throw new Error("Image fetch failed");
    const blob = await res.blob();
    const mimeType = blob.type || "image/jpeg";
    const extension = mimeType.includes("png") ? "png" : "jpg";
    return new File([blob], `${fileName}.${extension}`, { type: mimeType });
  } catch (err) {
    console.warn("Could not download image blob for native share:", err);
    return null;
  }
}

/**
 * ShareModal handles sharing product images and captions to WhatsApp Status.
 * Conforms strictly to:
 * - NO price included in the caption (forces buyers to click the link to see price / haggle)
 * - Native photo sharing via Web Share API (attaches real image file + caption to WhatsApp Status)
 * - 1-by-1 Status posting flow for bulk products
 * - Download photo + copy caption fallback for desktop
 */
export default function ShareModal({ isOpen, onClose, items = [], businessName = "My Kiosq" }) {
  const { addToast } = useToast();
  const [activeStep, setActiveStep] = useState(0); // For stepping through multiple items (1 by 1)
  const [isSharing, setIsSharing] = useState(false);
  const [copiedType, setCopiedType] = useState(null);

  // Reset active step when items change
  useEffect(() => {
    setActiveStep(0);
  }, [items]);

  const currentItem = items[activeStep] || items[0];

  // Build clean caption WITHOUT price
  const generateCaption = (item) => {
    if (!item) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const productUrl = `${origin}/product/${item.slug || item.id}`;

    const cleanCaption = item.whatsappCaption
      ? item.whatsappCaption
          .replace(/₦[\d,]+/g, "") // strip any price mentions
          .replace(/👉[\s\S]*$/, "")
          .trim()
      : `Brand new in stock from ${businessName}!`;

    return `🛍️ *${item.name}*\n${cleanCaption}\n\n👉 *Click here to see price & order safely:*\n${productUrl}\n\n🔒 *Protected by Kiosq SafeEscrow • Fast Doorstep Delivery*`;
  };

  // Caption for currently viewed item
  const [editableCaption, setEditableCaption] = useState("");

  useEffect(() => {
    if (currentItem) {
      setEditableCaption(generateCaption(currentItem));
    }
  }, [currentItem]);

  if (!isOpen || !items || items.length === 0 || !currentItem) return null;

  // 1. Primary Action: Share Photo + Caption to WhatsApp Status
  const handleShareToWhatsAppStatus = async () => {
    setIsSharing(true);
    const captionText = editableCaption.trim() || generateCaption(currentItem);

    try {
      // Check if native Web Share API supports file sharing (Mobile Chrome / iOS Safari)
      if (typeof navigator !== "undefined" && navigator.canShare) {
        const imageFile = await fetchImageFile(currentItem.image, `kiosq-${currentItem.slug || currentItem.id}`);

        if (imageFile && navigator.canShare({ files: [imageFile] })) {
          await navigator.share({
            files: [imageFile],
            text: captionText,
            title: currentItem.name,
          });

          addToast(`Shared "${currentItem.name}" image to WhatsApp!`, "success", 8000);

          // If in bulk mode and not at last item, advance to next item
          if (items.length > 1 && activeStep < items.length - 1) {
            setActiveStep((prev) => prev + 1);
          } else {
            onClose();
          }
          return;
        }
      }

      // Fallback for browsers without Web Share file support:
      // Open WhatsApp click-to-chat URL with text, and automatically download the photo
      handleDownloadImage();
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(captionText)}`;
      window.open(whatsappUrl, "_blank");

      addToast(
        "Downloaded product photo! In WhatsApp, select 'My Status', attach the photo, and paste your caption.",
        "info",
        12000
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
        addToast("Unable to trigger native share. Caption copied to clipboard.", "info", 8000);
        navigator.clipboard?.writeText(captionText);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // 2. Download product photo directly
  const handleDownloadImage = async () => {
    try {
      const res = await fetch(currentItem.image);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentItem.slug || "product"}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setCopiedType("image");
      addToast("Product image saved to your device!", "success", 6000);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      window.open(currentItem.image, "_blank");
    }
  };

  // 3. Copy Caption to clipboard
  const handleCopyCaption = () => {
    const captionText = editableCaption.trim() || generateCaption(currentItem);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(captionText);
      setCopiedType("caption");
      addToast("Caption & checkout link copied to clipboard!", "success", 8000);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // 4. Copy Link Only
  const handleCopyLinkOnly = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const productUrl = `${origin}/product/${currentItem.slug || currentItem.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(productUrl);
      setCopiedType("link");
      addToast("Product link copied!", "info", 6000);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surface-container-lowest border-2 border-primary shadow-[6px_6px_0px_#000000] rounded-DEFAULT p-5 sm:p-6 max-w-lg w-full flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">chat</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-extrabold text-on-surface">
                Share to WhatsApp Status
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Photo + Link (Price hidden so buyers tap to view)
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

        {/* Bulk Stepper Bar (if multiple products selected) */}
        {items.length > 1 && (
          <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-surface-container-high flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-black">
                {activeStep + 1} of {items.length}
              </span>
              <span className="text-body-sm font-bold text-on-surface truncate max-w-[160px] sm:max-w-[200px]">
                {currentItem.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="w-8 h-8 rounded-full border border-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors cursor-pointer"
                title="Previous product"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                disabled={activeStep === items.length - 1}
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="w-8 h-8 rounded-full border border-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors cursor-pointer"
                title="Next product"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}

        {/* Product Image & Caption Preview Box */}
        <div className="flex flex-col sm:flex-row gap-3.5 bg-surface-container-low p-3.5 rounded-DEFAULT border-2 border-primary/20">
          <div className="relative shrink-0 w-full sm:w-28 h-36 sm:h-28 rounded-DEFAULT overflow-hidden border border-outline-variant bg-surface-container">
            <img
              src={currentItem.image}
              alt={currentItem.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              Photo
            </span>
          </div>

          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <h4 className="text-headline-sm font-extrabold text-on-surface leading-tight">
                {currentItem.name}
              </h4>
              <span className="inline-block text-[11px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded-full mt-1">
                🔒 Price Hidden on Status
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Buyers must click your link to see price or start an AI negotiation.
            </p>
          </div>
        </div>

        {/* Editable Caption Preview */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
              WhatsApp Status Caption
            </label>
            <span className="text-xs text-on-surface-variant">Tap to customize</span>
          </div>
          <textarea
            rows={4}
            value={editableCaption}
            onChange={(e) => setEditableCaption(e.target.value)}
            className="w-full p-3 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
            placeholder="Status caption..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Main Action: Share Image + Caption directly to WhatsApp */}
          <button
            type="button"
            disabled={isSharing}
            onClick={handleShareToWhatsAppStatus}
            className="w-full h-13 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.98] text-white font-extrabold text-label-md flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_#000000] disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSharing ? "progress_activity" : "add_to_photos"}
            </span>
            <span>
              {isSharing
                ? "Preparing Photo..."
                : items.length > 1
                ? `Post Photo ${activeStep + 1} of ${items.length} to Status`
                : "Post Photo & Link to WhatsApp Status"}
            </span>
          </button>

          {/* Secondary Helpers */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              className="h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Save photo to your device"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedType === "image" ? "check" : "download"}
              </span>
              <span>{copiedType === "image" ? "Saved!" : "Save Photo"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCaption}
              className="h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Copy caption text to clipboard"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedType === "caption" ? "check" : "content_copy"}
              </span>
              <span>{copiedType === "caption" ? "Copied!" : "Copy Caption"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLinkOnly}
              className="h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Copy direct product link"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedType === "link" ? "check" : "link"}
              </span>
              <span>{copiedType === "link" ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
