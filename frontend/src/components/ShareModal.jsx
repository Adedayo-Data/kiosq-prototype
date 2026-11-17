import { useState, useMemo, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { stampProductImage, generateCollageCover } from "../utils/imageBranding";

/**
 * ShareModal handles sharing to WhatsApp Status:
 * - Single item: Stamped product photo + AI caption (price hidden) + "Pay with zero fear" CTA
 * - Bulk items: 4-Photo Lookbook Collage Cover (Slide #1) + all branded photos + master link
 */
export default function ShareModal({ isOpen, onClose, items = [], businessName = "Mama Tola Textiles" }) {
  const { addToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [copiedType, setCopiedType] = useState(null);

  // Formatted merchant catalog slug / link
  const merchantSlug = useMemo(() => {
    return businessName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  }, [businessName]);

  // Generate WhatsApp-ready caption
  const defaultText = useMemo(() => {
    if (!items || items.length === 0) return "";

    if (items.length === 1) {
      const item = items[0];
      const productUrl = `https://usekiosq.shop/product/${item.slug || item.id}`;
      const caption = item.whatsappCaption
        ? item.whatsappCaption
            .replace(/₦[\d,]+/g, "")
            .replace(/👉[\s\S]*$/, "")
            .trim()
        : `Authentic ${item.name} available in stock!`;

      return `🛍️ *${item.name}*\n${caption}\n\n👉 *Pay with zero fear • 100% Safe Delivery:*\n${productUrl}`;
    }

    // Bulk Share format (matches the collage cover slide #1)
    const storeUrl = `https://usekiosq.shop/${merchantSlug}`;
    return `🔥 *New Stock Just In from ${businessName}!* Swipe through to see today's arrivals.\n\n👉 *Pay with zero fear • 100% Safe Delivery:*\n${storeUrl}`;
  }, [items, businessName, merchantSlug]);

  const [customText, setCustomText] = useState(defaultText);

  // Sync customText when items change
  useEffect(() => {
    setCustomText(defaultText);
  }, [defaultText]);

  if (!isOpen || !items || items.length === 0) return null;

  // Primary Action: Share all photos + collage cover to WhatsApp in 1 tap
  const handleShareToWhatsApp = async () => {
    setIsSharing(true);
    const captionText = customText.trim() || defaultText;

    try {
      if (typeof navigator !== "undefined" && navigator.canShare) {
        let filesToShare = [];

        if (items.length === 1) {
          // Single item: Stamp the photo with "🛍️ Verified Stock • usekiosq.shop"
          const brandedFile = await stampProductImage(
            items[0].image,
            `kiosq-${items[0].slug || items[0].id}.jpg`
          );
          if (brandedFile) filesToShare.push(brandedFile);
        } else {
          // Bulk items:
          // 1. Generate Lookbook Collage Cover as Slide #1
          const collageCoverFile = await generateCollageCover(items, businessName);
          if (collageCoverFile) {
            filesToShare.push(collageCoverFile);
          }

          // 2. Stamp each individual product photo as subsequent slides
          const stampedPhotos = await Promise.all(
            items.map((item, idx) =>
              stampProductImage(item.image, `kiosq-${idx + 1}-${item.slug || item.id}.jpg`)
            )
          );
          filesToShare.push(...stampedPhotos.filter(Boolean));
        }

        // Test if files can be shared
        if (filesToShare.length > 0 && navigator.canShare({ files: filesToShare })) {
          await navigator.share({
            files: filesToShare,
            text: captionText,
            title: items.length === 1 ? items[0].name : `New Stock from ${businessName}`,
          });

          addToast(
            items.length === 1
              ? `Shared "${items[0].name}" to WhatsApp!`
              : `Shared Lookbook Cover + ${items.length} photos to WhatsApp!`,
            "success",
            8000
          );
          onClose();
          return;
        }
      }

      // Fallback: If device doesn't support Web Share API file attachments (e.g. desktop)
      await handleDownloadAllPhotos();
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(captionText)}`;
      window.open(whatsappUrl, "_blank");

      addToast(
        "Downloaded branded photos! Open WhatsApp, tap My Status, attach the photos, and paste your caption.",
        "info",
        12000
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
        addToast("Sharing interrupted. Caption copied to clipboard.", "info", 8000);
        navigator.clipboard?.writeText(captionText);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Download all photos (with branding + collage cover)
  const handleDownloadAllPhotos = async () => {
    try {
      if (items.length > 1) {
        // Download collage cover
        const cover = await generateCollageCover(items, businessName);
        if (cover) {
          triggerDownload(cover, "00-kiosq-new-arrivals-cover.jpg");
        }
      }

      // Download stamped photos
      for (let i = 0; i < items.length; i++) {
        const stamped = await stampProductImage(items[i].image, `kiosq-${i + 1}-${items[i].slug || "item"}.jpg`);
        if (stamped) {
          triggerDownload(stamped, stamped.name);
        }
      }

      setCopiedType("images");
      addToast(
        items.length === 1 ? "Saved branded product photo!" : `Saved cover + ${items.length} product photos to gallery!`,
        "success",
        6000
      );
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      addToast("Could not download all images automatically.", "error", 6000);
    }
  };

  const triggerDownload = (file, fileName) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Copy Caption to clipboard
  const handleCopyCaption = () => {
    const textToCopy = customText.trim() || defaultText;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedType("caption");
      addToast("WhatsApp caption copied to clipboard!", "success", 8000);
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
                {items.length === 1 ? "Share to WhatsApp Status" : `Bulk Share (${items.length} Items)`}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                {items.length > 1
                  ? "Collage Cover Slide + All Photos in 1 Tap"
                  : "Branded Photo + Zero Fear Link"}
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

        {/* Visual Preview Banner */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border-2 border-primary/20 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
              {items.length > 1 ? "Status Carousel Sequence" : "Branded Photo Preview"}
            </span>
            <span className="text-[11px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded-full">
              🛍️ Verified Stock • usekiosq.shop
            </span>
          </div>

          {items.length > 1 ? (
            <div className="flex items-center gap-2.5 overflow-x-auto py-1">
              {/* Slide 1: Lookbook Collage Tag */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-16 h-16 rounded-md bg-black text-white flex flex-col items-center justify-center p-1 text-center border-2 border-[#25D366] shadow-xs">
                  <span className="text-[9px] font-black text-[#25D366] uppercase">Slide 1</span>
                  <span className="text-[10px] font-bold leading-tight">Lookbook Cover</span>
                </div>
                <span className="text-[10px] font-bold text-primary">+ Caption</span>
              </div>

              {/* Subsequent Slides: Product Photos */}
              {items.map((item, idx) => (
                <div key={item.id} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-outline-variant bg-surface-container">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                      {idx + 2}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant truncate max-w-[64px]">
                    Photo {idx + 2}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={items[0].image}
                alt={items[0].name}
                className="w-16 h-16 rounded-md object-cover border border-outline-variant shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <h4 className="text-body-md font-extrabold text-on-surface truncate">{items[0].name}</h4>
                <span className="text-xs text-on-surface-variant">Price hidden • Buyer taps link to view</span>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Post Caption Preview */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
              WhatsApp Status Caption
            </label>
            <span className="text-xs text-on-surface-variant">Editable</span>
          </div>
          <textarea
            rows={items.length > 1 ? 4 : 5}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full p-3 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
            placeholder="Type your WhatsApp post caption here..."
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Main 1-Tap Action */}
          <button
            type="button"
            disabled={isSharing}
            onClick={handleShareToWhatsApp}
            className="w-full h-13 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] active:scale-[0.98] text-white font-extrabold text-label-md flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0px_#000000] disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSharing ? "progress_activity" : "chat"}
            </span>
            <span>
              {isSharing
                ? "Preparing Lookbook & Photos..."
                : items.length > 1
                ? `Post Cover + ${items.length} Photos to WhatsApp Status (1 Tap)`
                : "Post Branded Photo to WhatsApp Status"}
            </span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadAllPhotos}
              className="h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Download cover and all photos to phone gallery"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedType === "images" ? "check" : "download"}
              </span>
              <span>{copiedType === "images" ? "Saved to Gallery!" : "Save All to Gallery"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCaption}
              className="h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Copy caption text and link"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedType === "caption" ? "check" : "content_copy"}
              </span>
              <span>{copiedType === "caption" ? "Copied!" : "Copy Caption"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
