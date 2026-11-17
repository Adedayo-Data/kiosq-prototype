import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useToast } from "../context/ToastContext";
import { FALLBACK_ANKARA_IMAGE, API_BASE_URL } from "../utils/constants";

export default function BuyerProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState("25500");
  const [customOffer, setCustomOffer] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    askingPrice: "",
    floorPrice: "",
    whatsappCaption: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("kiosq_merchant");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    }

    if (id) {
      fetch(`${API_BASE_URL}/api/v1/products/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setProduct(data);
            if (data.askingPrice) {
              const asking = Number(data.askingPrice);
              setSelectedOffer(String(Math.round(asking * 0.9)));
            }
          }
        })
        .catch(() => {});
    }
  }, [id]);

  const isOwner = Boolean(
    currentUser &&
      product &&
      (
        (product.merchantId && String(currentUser.id) === String(product.merchantId)) ||
        (product.merchantName && currentUser.businessName && 
          product.merchantName.trim().toLowerCase() === currentUser.businessName.trim().toLowerCase()) ||
        (currentUser.email === "tola@kiosq.africa" && (product.merchantName?.includes("Mama Tola") || !product.merchantName))
      )
  );

  const handleStartHaggle = (offerVal) => {
    const slug = product?.slug || id || "ankara-wax";
    navigate(`/haggle/${slug}?offer=${offerVal || selectedOffer}`);
  };

  const displayTitle = product?.title || "Authentic Ankara Wax Print (6 Yards)";
  const displayPrice = product?.askingPrice
    ? `₦${Number(product.askingPrice).toLocaleString()}`
    : "₦28,000";
  const displayMerchant = product?.merchantName || "Mama Tola Textiles";
  const displayLocation = product?.merchantLocation || "Balogun Market, Lagos Island";

  const sanitizedUrl = (product?.imageUrl && !product.imageUrl.includes("lh3.googleusercontent.com") && product.imageUrl.trim() !== "")
    ? product.imageUrl
    : FALLBACK_ANKARA_IMAGE;
  const [imgSrc, setImgSrc] = useState(sanitizedUrl);

  useEffect(() => {
    if (product?.imageUrl && !product.imageUrl.includes("lh3.googleusercontent.com") && product.imageUrl.trim() !== "") {
      setImgSrc(product.imageUrl);
    } else {
      setImgSrc(FALLBACK_ANKARA_IMAGE);
    }
  }, [product]);

  const handleShareWhatsApp = () => {
    const productUrl = window.location.href;
    const text = product?.whatsappCaption
      ? `${product.whatsappCaption}\n\n👉 Pay or Haggle Safely: ${productUrl}`
      : `🔥 ${displayTitle} • ${displayPrice}\nProtected by Kiosq Escrow: ${productUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addToast(
        "WhatsApp share card & link copied to clipboard! Paste directly into your status or chat.",
        "success",
        10000
      );
    } else {
      addToast(`Share link: ${productUrl}`, "info", 10000);
    }
  };

  const handleSaveEdit = async () => {
    if (!product?.id) {
      setProduct((prev) => ({
        ...prev,
        title: editForm.title || displayTitle,
        askingPrice: editForm.askingPrice || "28000",
        floorPrice: editForm.floorPrice || "23000",
        whatsappCaption: editForm.whatsappCaption,
      }));
      addToast("Listing details updated!", "success", 10000);
      setIsEditModalOpen(false);
      return;
    }

    setIsSavingEdit(true);
    try {
      const token = localStorage.getItem("kiosq_token");
      const res = await fetch(`${API_BASE_URL}/api/v1/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: editForm.title,
          askingPrice: Number(editForm.askingPrice),
          floorPrice: Number(editForm.floorPrice),
          whatsappCaption: editForm.whatsappCaption,
        }),
      });

      if (!res.ok) throw new Error("Could not update listing on server.");
      const updated = await res.json();
      setProduct((prev) => ({
        ...prev,
        title: updated.title,
        askingPrice: updated.askingPrice,
        floorPrice: updated.floorPrice,
        whatsappCaption: updated.whatsappCaption,
      }));
      addToast("Listing updated successfully!", "success", 10000);
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to update listing.", "error", 12000);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-4xl px-4 sm:px-6 py-4 pb-28">
        <div className="flex flex-col w-full">
          {/* Top WhatsApp Origin Bar */}
          <div className="flex items-center justify-between py-2 mb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#25D366]/15 text-[#128C7E] px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">chat</span>
                WhatsApp Verified Link
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold bg-surface-container-high px-2 py-0.5 rounded-full">
                BALOGUN LIVE
              </span>
            </div>
          </div>

          {/* Desktop 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Product Gallery & Badges */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="relative w-full rounded-DEFAULT bg-surface-container overflow-hidden shadow-xs border border-outline-variant/30 min-h-[300px] sm:min-h-[380px] flex items-center justify-center">
                <img
                  src={imgSrc}
                  alt={displayTitle}
                  onError={() => setImgSrc(FALLBACK_ANKARA_IMAGE)}
                  className="w-full h-80 sm:h-96 object-cover block"
                />

                {/* Floating Tag */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1.5 bg-primary/90 backdrop-blur-xs text-on-primary px-3 py-1 rounded-full text-label-sm font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[15px] text-secondary-container">
                    verified
                  </span>
                  <span>Verified by Kiosq</span>
                </div>

                <div className="absolute bottom-3 right-3 z-10 pointer-events-none bg-surface/90 backdrop-blur-xs text-on-surface px-2.5 py-1 rounded-full text-label-sm font-bold shadow-xs">
                  {product?.category || "Verified Merchandise"}
                </div>
              </div>

              {/* Material Details Block */}
              <div className="rounded-DEFAULT bg-surface-container-low p-4 border border-outline-variant/30">
                <h4 className="text-label-lg text-on-surface uppercase tracking-wider mb-3 font-bold">
                  Material Details
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div>
                    <span className="block text-label-sm text-on-surface-variant font-medium">
                      LENGTH
                    </span>
                    <span className="text-body-md text-on-surface font-bold">6 Yards (5.48m)</span>
                  </div>
                  <div>
                    <span className="block text-label-sm text-on-surface-variant font-medium">
                      WIDTH
                    </span>
                    <span className="text-body-md text-on-surface font-bold">48 Inches standard</span>
                  </div>
                  <div>
                    <span className="block text-label-sm text-on-surface-variant font-medium">
                      TEXTURE
                    </span>
                    <span className="text-body-md text-on-surface font-bold">
                      Crisp Holland Finish
                    </span>
                  </div>
                  <div>
                    <span className="block text-label-sm text-on-surface-variant font-medium">
                      ORIGIN
                    </span>
                    <span className="text-body-md text-on-surface font-bold">
                      {displayLocation}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing, Merchant, Escrow Guarantee & CTAs */}
            <div className="md:col-span-6 flex flex-col gap-5">
              {/* Product Title & Asking Price */}
              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-0.5 mb-1.5 text-label-sm rounded-DEFAULT bg-surface-container-high text-on-surface uppercase font-bold tracking-tight">
                      Verified Stock
                    </span>
                    <h1 className="text-headline-lg sm:text-[28px] text-on-surface font-extrabold tracking-tight leading-tight">
                      {displayTitle}
                    </h1>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      {product?.description || "Authentic social commerce stock • Verified escrow guaranteed"}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-[32px] font-extrabold text-on-surface tracking-tight">
                    {displayPrice}
                  </span>
                  <span className="text-label-sm bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                    Floor protected
                  </span>
                </div>
              </div>

              {/* Merchant Profile Card */}
              <div className="rounded-DEFAULT bg-surface-container-lowest p-4 shadow-xs border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                    <span className="material-symbols-outlined text-[26px]">storefront</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="text-headline-sm text-on-surface truncate font-bold">
                        {displayMerchant}
                      </h3>
                      <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                        check_circle
                      </span>
                    </div>
                    <span className="text-body-sm text-on-surface-variant flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[14px] shrink-0">location_on</span>
                      <span className="truncate">{displayLocation}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1 text-label-sm font-bold text-on-surface bg-surface-container-high px-2.5 py-1 rounded-full whitespace-nowrap">
                    ★ 4.9 (142 deals)
                  </span>
                </div>
              </div>

              {/* Escrow Protection Seal */}
              <div className="rounded-DEFAULT bg-surface-container-lowest p-4 shadow-xs border border-outline-variant/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container">
                    <span className="material-symbols-outlined text-[16px]">shield</span>
                    <span className="text-label-md font-bold">Kiosq SafeEscrow Protection</span>
                  </div>
                  <span className="text-label-sm text-secondary font-bold whitespace-nowrap">Escrow Protected</span>
                </div>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Your money is held in escrow until you confirm delivery with your <strong>4-digit delivery PIN</strong>. 24-hour return guarantee if not as described.
                </p>
              </div>

              {/* Action Buttons: Conditional based on whether viewer is Owner or Buyer */}
              {isOwner ? (
                <div className="flex flex-col gap-3 pt-2">
                  {/* Owner View Status Card */}
                  <div className="bg-surface-container-high/60 border-2 border-primary/20 rounded-DEFAULT p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                      </div>
                      <div>
                        <span className="text-label-md font-bold text-on-surface block leading-tight">
                          You are viewing your own Kiosq listing
                        </span>
                        <span className="text-body-sm text-on-surface-variant text-xs">
                          Buyers see Haggle and Escrow Purchase buttons here
                        </span>
                      </div>
                    </div>
                    <span className="text-label-sm font-bold bg-primary text-on-primary px-3 py-1 rounded-full text-xs">
                      Owner View
                    </span>
                  </div>

                  {/* Desktop Owner Action Buttons */}
                  <div className="hidden md:flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditForm({
                          title: product?.title || displayTitle,
                          askingPrice: product?.askingPrice || "28000",
                          floorPrice: product?.floorPrice || "23000",
                          whatsappCaption: product?.whatsappCaption || "",
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="flex-1 h-13 rounded-full bg-surface-container-lowest border-2 border-primary text-on-surface text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                      <span>Edit Listing</span>
                    </button>

                    <button
                      onClick={handleShareWhatsApp}
                      className="flex-1 h-13 rounded-full bg-[#25D366] text-white text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-[#1ebd59] transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                      <span>Share to WhatsApp</span>
                    </button>
                  </div>

                  <Link
                    to="/dashboard"
                    className="text-label-sm font-bold text-on-surface-variant hover:text-on-surface text-center flex items-center justify-center gap-1.5 py-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    <span>Back to Seller Dashboard</span>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsOfferModalOpen(true)}
                      className="flex-1 h-13 rounded-full bg-surface-container-lowest border-2 border-primary text-on-surface font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] px-3 sm:px-4 text-sm sm:text-base min-w-0"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0">
                        chat_bubble_outline
                      </span>
                      <span className="truncate">Make an Offer / Haggle</span>
                    </button>

                    <Link
                      to={`/escrow/order-${product?.id || "4821"}`}
                      className="flex-1 h-13 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] px-3 sm:px-4 text-sm sm:text-base min-w-0"
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0">lock</span>
                      <span className="truncate">Buy Now ({displayPrice})</span>
                    </Link>
                  </div>
                  <p className="text-xs text-center text-on-surface-variant">
                    Your money is held in escrow until you confirm delivery.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-3 sm:px-4 py-3 border-t border-outline-variant/40 shadow-lg">
        {isOwner ? (
          <div className="max-w-md mx-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setEditForm({
                  title: product?.title || displayTitle,
                  askingPrice: product?.askingPrice || "28000",
                  floorPrice: product?.floorPrice || "23000",
                  whatsappCaption: product?.whatsappCaption || "",
                });
                setIsEditModalOpen(true);
              }}
              className="flex-1 h-12 rounded-full bg-surface-container-lowest border-2 border-primary text-on-surface font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform text-xs sm:text-sm px-2 min-w-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">edit</span>
              <span className="truncate">Edit Listing</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex-1 h-12 rounded-full bg-[#25D366] text-white font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-md text-xs sm:text-sm px-2 min-w-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">share</span>
              <span className="truncate">Share</span>
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="flex-1 h-12 rounded-full bg-surface-container-lowest border-2 border-primary text-on-surface font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform text-xs sm:text-sm px-2 min-w-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">chat_bubble_outline</span>
              <span className="truncate">Make Offer</span>
            </button>

            <Link
              to={`/escrow/order-${product?.id || "4821"}`}
              className="flex-1 h-12 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-md text-xs sm:text-sm px-2 min-w-0"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">lock</span>
              <span className="truncate">Buy Now ({displayPrice})</span>
            </Link>
          </div>
        )}
      </div>

      {/* Owner Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-DEFAULT border-2 border-primary shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">edit</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Edit Product Listing</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm font-bold text-on-surface uppercase">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-body-md font-bold text-on-surface focus:outline-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-bold text-on-surface uppercase">Asking Price (₦)</label>
                  <input
                    type="number"
                    value={editForm.askingPrice}
                    onChange={(e) => setEditForm((f) => ({ ...f, askingPrice: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-headline-sm font-bold text-on-surface focus:outline-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-label-sm font-bold text-secondary uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Floor Price (₦)
                  </label>
                  <input
                    type="number"
                    value={editForm.floorPrice}
                    onChange={(e) => setEditForm((f) => ({ ...f, floorPrice: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-secondary text-headline-sm font-bold text-secondary focus:outline-secondary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 bg-surface-container-low p-3 rounded-DEFAULT border border-outline-variant/40">
                <label className="text-label-sm font-bold text-on-surface uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
                  WhatsApp Caption &amp; Link
                </label>
                <textarea
                  rows={4}
                  value={editForm.whatsappCaption}
                  onChange={(e) => setEditForm((f) => ({ ...f, whatsappCaption: e.target.value }))}
                  className="w-full p-2.5 rounded-md bg-surface-container-lowest border border-outline-variant text-body-sm text-on-surface focus:outline-primary resize-none mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 h-11 rounded-full bg-surface-container text-on-surface text-label-md font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-6 h-11 rounded-full bg-primary text-on-primary text-label-md font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000] disabled:opacity-60"
              >
                {isSavingEdit ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Negotiation Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-outline-variant/30 flex flex-col gap-4">
            <div className="w-12 h-1 bg-outline-variant mx-auto rounded-full sm:hidden" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                  AI
                </div>
                <div>
                  <h3 className="text-headline-sm text-on-surface font-bold">
                    Kiosq AI Negotiator
                  </h3>
                  <p className="text-xs text-on-surface-variant">Mama Tola's automated agent</p>
                </div>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              Enter your target offer. The AI evaluates your bid in real-time against the merchant's
              floor price and closes the deal.
            </p>

            {/* Quick Preset Offer Chips */}
            <div className="flex flex-col gap-1.5">
              <span className="text-label-sm font-bold text-on-surface-variant uppercase">
                Quick Offer Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {["24000", "25500", "26500"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelectedOffer(amt);
                      setCustomOffer(amt);
                    }}
                    className={`py-2 px-3 rounded-DEFAULT text-label-md font-bold border transition-all cursor-pointer ${
                      selectedOffer === amt
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    ₦{Number(amt).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-bold text-on-surface-variant">
                Or custom amount (₦)
              </label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={customOffer}
                onChange={(e) => {
                  setCustomOffer(e.target.value);
                  setSelectedOffer(e.target.value);
                }}
                className="w-full h-11 px-3 rounded-DEFAULT bg-surface-container border border-outline-variant/50 text-headline-sm font-bold text-on-surface focus:outline-primary"
              />
            </div>

            {/* Submit Offer */}
            <button
              onClick={() => handleStartHaggle(customOffer || selectedOffer)}
              className="w-full h-12 rounded-full bg-primary text-on-primary text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all cursor-pointer shadow-md"
            >
              <span>Negotiate with AI Now</span>
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
