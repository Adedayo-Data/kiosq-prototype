import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function AddProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState("Authentic Nigerian Vintage Ankara Wax (6 Yards)");
  const [askingPrice, setAskingPrice] = useState("28000");
  const [floorPrice, setFloorPrice] = useState("23000");
  const [caption, setCaption] = useState(
    "Fresh drops straight from Balogun Market! 100% pure combed cotton, crisp Holland finish. Tap link to buy directly with Kiosq Safe Escrow or haggle with my AI bot."
  );

  const handleRegenerate = () => {
    setCaption(
      "Original Hollandais Ankara 6 yards! No story, no fake alert. Pay into Kiosq Escrow with your 4-digit PIN handoff. Best deal in Lagos today!"
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Product saved & ready to share on WhatsApp Status!");
    navigate("/dashboard");
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-2xl px-4 sm:px-6 py-6 pb-20">
        <form onSubmit={handleSave} className="flex flex-col gap-6 w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Dashboard</span>
            </Link>

            <span className="text-label-sm font-bold bg-surface-container-high px-3 py-1 rounded-full">
              AI Listing Assistant
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-headline-lg font-extrabold text-on-surface">List New Product</h1>
            <p className="text-body-sm text-on-surface-variant">
              Snap a photo, set your floor price, and Kiosq AI handles the rest.
            </p>
          </div>

          {/* Photo Upload Simulation Box */}
          <div className="border-2 border-dashed border-outline-variant rounded-DEFAULT p-6 flex flex-col items-center text-center gap-2 bg-surface-container-lowest hover:border-primary transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
            </div>
            <span className="text-label-md font-bold text-on-surface">
              Upload Item Photos or Video
            </span>
            <span className="text-body-sm text-on-surface-variant">
              AI automatically extracts details and drafts high-converting WhatsApp captions
            </span>
          </div>

          {/* Product Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-bold text-on-surface uppercase">
              Product Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-lowest border border-outline-variant text-body-md font-bold text-on-surface focus:outline-primary"
              required
            />
          </div>

          {/* Pricing Grid: Asking vs Floor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-on-surface uppercase">
                Asking Price (₦)
              </label>
              <input
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-lowest border border-outline-variant text-headline-sm font-extrabold text-on-surface focus:outline-primary"
                required
              />
              <span className="text-xs text-on-surface-variant">Displayed to buyers</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-secondary uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Minimum Floor Price (₦)
              </label>
              <input
                type="number"
                value={floorPrice}
                onChange={(e) => setFloorPrice(e.target.value)}
                className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-lowest border-2 border-secondary text-headline-sm font-extrabold text-secondary focus:outline-secondary"
                required
              />
              <span className="text-xs text-on-surface-variant">
                AI will strictly never sell below this
              </span>
            </div>
          </div>

          {/* AI Generated Caption Box */}
          <div className="flex flex-col gap-1.5 bg-surface-container-lowest p-4 rounded-DEFAULT border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <label className="text-label-sm font-bold text-on-surface uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
                AI WhatsApp Caption
              </label>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-label-sm font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Regenerate</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2.5 rounded-md bg-surface-container border border-outline-variant text-body-sm text-on-surface focus:outline-primary resize-none mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:flex-1 h-13 rounded-full bg-primary text-on-primary text-headline-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              <span>Save &amp; Share to WhatsApp</span>
            </button>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 h-13 rounded-full bg-surface-container text-on-surface text-label-md font-bold flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              Save Draft
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
