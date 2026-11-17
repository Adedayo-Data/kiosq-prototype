import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { uploadMultipleToCloudinary } from "../utils/cloudinary";

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload & processing state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Staged products array (supports up to 20 images)
  const [stagedProducts, setStagedProducts] = useState([]);

  // Active product being edited in detail view
  const [editingIndex, setEditingIndex] = useState(null);

  // Handle file selection (up to 20 photos)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length > 20) {
      setError("Please select at most 20 images at a time.");
      return;
    }

    setError("");
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      // 1. Direct Unsigned Upload to Cloudinary (compressed & chunked)
      const uploadResults = await uploadMultipleToCloudinary(files, (curr, tot) => {
        setUploadProgress({ current: curr, total: tot });
      });

      const imageUrls = uploadResults.map((r) => r.url);

      // 2. Request AI Titles & WhatsApp Captions with auto-generated links from backend
      const token = localStorage.getItem("kiosq_token");
      const merchantData = JSON.parse(localStorage.getItem("kiosq_merchant") || "{}");

      const draftRes = await fetch("http://localhost:8080/api/v1/products/bulk-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageUrls,
          businessName: merchantData.businessName || "My Kiosq",
        }),
      });

      if (!draftRes.ok) {
        throw new Error("Failed to generate AI captions. Using local fallback.");
      }

      const drafts = await draftRes.json();

      // Transform into editable staged items
      const newItems = drafts.map((d, idx) => ({
        id: Date.now() + idx,
        imageUrl: d.imageUrl,
        title: d.suggestedTitle,
        askingPrice: "",
        floorPrice: "",
        whatsappCaption: d.whatsappCaption,
        slug: d.slug,
      }));

      setStagedProducts(newItems);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to process images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Update specific field for a staged product
  const handleFieldChange = (index, field, value) => {
    setStagedProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Remove a staged product
  const handleRemove = (index) => {
    setStagedProducts((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  // Save all staged products to the database
  const handleSaveAll = async () => {
    if (!stagedProducts.length) return;

    // Validate that asking prices are provided
    const missingPrice = stagedProducts.some((p) => !p.askingPrice || Number(p.askingPrice) <= 0);
    if (missingPrice) {
      setError("Please specify an Asking Price for every product before saving.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("kiosq_token");

      const payload = {
        items: stagedProducts.map((p) => ({
          title: p.title,
          description: p.title,
          askingPrice: Number(p.askingPrice),
          floorPrice: p.floorPrice ? Number(p.floorPrice) : Math.round(Number(p.askingPrice) * 0.85),
          imageUrl: p.imageUrl,
          whatsappCaption: p.whatsappCaption,
          slug: p.slug,
        })),
      };

      const res = await fetch("http://localhost:8080/api/v1/products/bulk-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save products to database.");
      }

      alert(`🎉 Successfully listed ${stagedProducts.length} products to your Kiosq!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error saving products.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-5xl px-4 sm:px-6 py-6 pb-24">
        <div className="flex flex-col gap-6 w-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Dashboard</span>
            </Link>

            <span className="text-label-sm font-bold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">bolt</span>
              Batch Photo Staging (Up to 20)
            </span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
              List Products with Photo Dump
            </h1>
            <p className="text-body-sm text-on-surface-variant max-w-xl">
              Upload up to 20 images at once. Everything automatically arranges into ready-to-sell
              cards while AI writes your titles and WhatsApp Status captions with direct checkout links.
            </p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-3.5 rounded-DEFAULT text-body-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone (Visible when no staged items or uploading) */}
          {stagedProducts.length === 0 && (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-primary rounded-DEFAULT p-8 sm:p-12 flex flex-col items-center text-center gap-3 bg-surface-container-lowest transition-all cursor-pointer shadow-[3px_3px_0px_#000000] hover:bg-surface-container-low ${
                isUploading ? "pointer-events-none opacity-80" : ""
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[28px]">
                  {isUploading ? "hourglass_top" : "add_photo_alternate"}
                </span>
              </div>

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-headline-sm font-bold text-on-surface">
                    Uploading &amp; Arranging {uploadProgress.current} of {uploadProgress.total}...
                  </span>
                  <div className="w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / (uploadProgress.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-body-sm text-on-surface-variant">
                    Uploading to Cloudinary &amp; generating AI captions...
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-headline-sm font-bold text-on-surface">
                    Drop up to 20 Photos Here
                  </span>
                  <p className="text-body-sm text-on-surface-variant max-w-sm">
                    Select all products you want to post to your WhatsApp Status today. We compress
                    and stage them instantly.
                  </p>
                  <button
                    type="button"
                    className="mt-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_library</span>
                    <span>Browse Gallery</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Staging Grid View (When images are staged) */}
          {stagedProducts.length > 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-container p-3.5 rounded-DEFAULT border border-surface-container-high">
                <span className="text-label-md font-bold text-on-surface flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                  {stagedProducts.length} Items Arranged &amp; Ready for Pricing
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-label-sm font-bold text-on-surface hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add More</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Responsive Staging Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stagedProducts.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest rounded-DEFAULT border-2 border-primary shadow-[3px_3px_0px_#000000] p-4 flex flex-col justify-between gap-3 relative overflow-hidden"
                  >
                    {/* Top Thumbnail & Delete Action */}
                    <div className="relative w-full h-44 rounded-md overflow-hidden bg-surface-container">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemove(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                      <span className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur-xs text-on-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Editable Title */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">
                        Product Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleFieldChange(idx, "title", e.target.value)}
                        className="w-full text-label-md font-bold text-on-surface border-b border-outline-variant/60 focus:border-primary focus:outline-none pb-0.5"
                      />
                    </div>

                    {/* Price Inputs Grid: Asking Price & Floor Price */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-on-surface uppercase">
                          Asking (₦) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 25000"
                          value={item.askingPrice}
                          onChange={(e) => handleFieldChange(idx, "askingPrice", e.target.value)}
                          className="w-full h-10 px-2 rounded-DEFAULT bg-surface-container border border-outline-variant text-body-sm font-bold text-on-surface focus:outline-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-secondary uppercase flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">lock</span>
                          Floor (₦)
                        </label>
                        <input
                          type="number"
                          placeholder="Min price"
                          value={item.floorPrice}
                          onChange={(e) => handleFieldChange(idx, "floorPrice", e.target.value)}
                          className="w-full h-10 px-2 rounded-DEFAULT bg-surface-container border border-secondary text-body-sm font-bold text-secondary focus:outline-secondary"
                        />
                      </div>
                    </div>

                    {/* Actions: Edit in Detail Modal & WhatsApp Caption Preview */}
                    <div className="pt-2 border-t border-surface-container-high flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setEditingIndex(idx)}
                        className="text-label-sm font-bold text-on-surface underline underline-offset-4 flex items-center gap-1 hover:text-neutral-600 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">tune</span>
                        <span>Customize Details</span>
                      </button>

                      <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        Link Ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar to Publish All */}
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-4 py-3 border-t-2 border-primary shadow-[0_-4px_0px_#000000]">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                  <div className="hidden sm:flex flex-col">
                    <span className="text-label-md font-bold text-on-surface">
                      {stagedProducts.length} Products Staged
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      AI captions &amp; WhatsApp checkout links generated
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setStagedProducts([])}
                      className="px-4 h-12 rounded-full bg-surface-container text-on-surface text-label-md font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveAll}
                      className="flex-1 sm:flex-initial px-8 h-12 rounded-full bg-primary text-on-primary text-headline-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all cursor-pointer shadow-[2px_2px_0px_#000000] disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                      <span>
                        {isSaving
                          ? "Saving Products..."
                          : `Publish All (${stagedProducts.length}) to Kiosq`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Product Editor Modal (Reuses the single-product view) */}
          {editingIndex !== null && stagedProducts[editingIndex] && (
            <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-DEFAULT border-2 border-primary shadow-[6px_6px_0px_#000000] p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                  <h3 className="text-headline-sm font-bold text-on-surface">
                    Edit Product #{editingIndex + 1}
                  </h3>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Photo Preview */}
                  <img
                    src={stagedProducts[editingIndex].imageUrl}
                    alt="Preview"
                    className="w-full h-52 object-cover rounded-DEFAULT border border-outline-variant"
                  />

                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-sm font-bold text-on-surface uppercase">
                      Product Title
                    </label>
                    <input
                      type="text"
                      value={stagedProducts[editingIndex].title}
                      onChange={(e) => handleFieldChange(editingIndex, "title", e.target.value)}
                      className="w-full h-11 px-3.5 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-body-md font-bold text-on-surface focus:outline-primary"
                    />
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-on-surface uppercase">
                        Asking Price (₦)
                      </label>
                      <input
                        type="number"
                        value={stagedProducts[editingIndex].askingPrice}
                        onChange={(e) =>
                          handleFieldChange(editingIndex, "askingPrice", e.target.value)
                        }
                        className="w-full h-11 px-3.5 rounded-DEFAULT bg-surface-container-low border border-outline-variant text-headline-sm font-bold text-on-surface focus:outline-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-secondary uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        Floor Price (₦)
                      </label>
                      <input
                        type="number"
                        value={stagedProducts[editingIndex].floorPrice}
                        onChange={(e) =>
                          handleFieldChange(editingIndex, "floorPrice", e.target.value)
                        }
                        className="w-full h-11 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-secondary text-headline-sm font-bold text-secondary focus:outline-secondary"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Caption with Storefront Link */}
                  <div className="flex flex-col gap-1.5 bg-surface-container-low p-3.5 rounded-DEFAULT border border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <label className="text-label-sm font-bold text-on-surface uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          auto_awesome
                        </span>
                        WhatsApp Caption (Includes Direct Checkout Link)
                      </label>
                    </div>
                    <textarea
                      rows={5}
                      value={stagedProducts[editingIndex].whatsappCaption}
                      onChange={(e) =>
                        handleFieldChange(editingIndex, "whatsappCaption", e.target.value)
                      }
                      className="w-full p-2.5 rounded-md bg-surface-container-lowest border border-outline-variant text-body-sm text-on-surface focus:outline-primary resize-none mt-1 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="w-full h-11 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center justify-center hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
                  >
                    Done Editing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
