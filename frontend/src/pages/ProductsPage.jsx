import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useToast } from "../context/ToastContext";
import {
  FALLBACK_ANKARA_IMAGE,
  FALLBACK_SNEAKERS_IMAGE,
  FALLBACK_BAG_IMAGE,
  API_BASE_URL,
} from "../utils/constants";
import KiosqLogo from "../components/KiosqLogo";
import ShareModal from "../components/ShareModal";

const fallbackProducts = [
  {
    id: 1,
    slug: "vibrant-ankara-wax-fabric",
    name: "Vibrant Ankara Wax Fabric (6 Yards)",
    price: "₦28,000",
    floor: "₦23,000",
    status: "In Escrow",
    views: 312,
    offers: 14,
    image: FALLBACK_ANKARA_IMAGE,
    whatsappCaption: "Authentic Dutch Ankara wax 6 yards. Crisp finish with high durability. Order safely via Kiosq Escrow!",
  },
  {
    id: 2,
    slug: "nike-air-jordan-1-high-og",
    name: "Nike Air Jordan 1 High OG (Dropship)",
    price: "₦65,000",
    floor: "₦58,000",
    status: "Active",
    views: 520,
    offers: 28,
    image: FALLBACK_SNEAKERS_IMAGE,
    whatsappCaption: "Brand new high-top OG sneakers. Sizes 41-45 available with verified supplier inspection. Lock deal now!",
  },
  {
    id: 3,
    slug: "handcrafted-lagos-leather-tote",
    name: "Handcrafted Lagos Leather Tote",
    price: "₦34,000",
    floor: "₦29,000",
    status: "Active",
    views: 184,
    offers: 9,
    image: FALLBACK_BAG_IMAGE,
    whatsappCaption: "Genuine textured black leather tote bag with gold-tone hardware. Direct from artisan maker. Guaranteed escrow delivery!",
  },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Share Modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [itemsToShare, setItemsToShare] = useState([]);

  const merchant = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kiosq_merchant") || "{}");
    } catch {
      return {};
    }
  }, []);

  // Fetch products from backend or use fallback
  useEffect(() => {
    const token = localStorage.getItem("kiosq_token");

    const fetchProducts = async () => {
      try {
        let res = await fetch(`${API_BASE_URL}/api/v1/products`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          res = await fetch(`${API_BASE_URL}/api/v1/merchant/products`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        }
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.title,
              price: `₦${Number(p.askingPrice).toLocaleString()}`,
              floor: `₦${Number(p.floorPrice).toLocaleString()}`,
              status: "Active",
              views: p.viewCount || 0,
              offers: p.offerCount || 0,
              image: p.imageUrl || FALLBACK_ANKARA_IMAGE,
              whatsappCaption: p.whatsappCaption,
            }));
            const custom = JSON.parse(localStorage.getItem("kiosq_custom_products") || "[]");
            setProducts([...custom, ...mapped]);
            return;
          }
        }
        const custom = JSON.parse(localStorage.getItem("kiosq_custom_products") || "[]");
        setProducts([...custom, ...fallbackProducts]);
      } catch (err) {
        const custom = JSON.parse(localStorage.getItem("kiosq_custom_products") || "[]");
        setProducts([...custom, ...fallbackProducts]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtered & Searched products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "escrow"
          ? p.status.toLowerCase().includes("escrow")
          : p.status.toLowerCase() === "active";
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, filter]);

  // Bulk selection helpers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // Open share for a single product
  const handleShareSingle = (product) => {
    setItemsToShare([product]);
    setShareModalOpen(true);
  };

  // Open share for all selected products
  const handleBulkShare = () => {
    const selectedItems = products.filter((p) => selectedIds.has(p.id));
    if (selectedItems.length === 0) {
      addToast("Please select at least one product to share.", "info", 5000);
      return;
    }
    setItemsToShare(selectedItems);
    setShareModalOpen(true);
  };

  const isAllSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 pb-28">
        <div className="flex flex-col gap-6 w-full">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Dashboard</span>
              </Link>
              <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
                <KiosqLogo className="h-10 sm:h-12 w-auto" />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/add-product"
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3.5 py-2 rounded-full text-label-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>List Item</span>
              </Link>
            </div>
          </div>

          {/* Heading & Bulk Share Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
                All Products ({products.length})
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                Select products to bulk share directly to your WhatsApp Status or DM customers.
              </p>
            </div>

            {/* Quick Bulk Share Action if any selected */}
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkShare}
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-4 py-2.5 rounded-full text-label-sm font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#000000] shrink-0 animate-fade-in"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Share {selectedIds.size} Selected to WhatsApp</span>
              </button>
            )}
          </div>

          {/* Search, Filter Tabs & Select All Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-DEFAULT border border-surface-container-high">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-DEFAULT bg-surface-container-lowest border border-outline-variant text-body-sm font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] text-on-surface-variant">
                search
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Select All Toggle */}
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-DEFAULT border-2 border-primary bg-surface-container-lowest text-xs font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAllSelected ? "check_box" : "check_box_outline_blank"}
                </span>
                <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
              </button>

              {/* Status Filter Tabs */}
              <div className="flex bg-surface-container p-1 rounded-DEFAULT border border-surface-container-high">
                {["all", "active", "escrow"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1 text-xs font-bold rounded-DEFAULT capitalize transition-all cursor-pointer ${
                      filter === tab
                        ? "bg-primary text-on-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tab === "all" ? "All" : tab === "escrow" ? "In Escrow" : "Active"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
              <span className="text-body-sm font-semibold">Loading your catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-DEFAULT p-10 flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">inventory_2</span>
              <h3 className="text-headline-sm font-bold text-on-surface">No Products Found</h3>
              <p className="text-body-sm text-on-surface-variant max-w-sm">
                {searchQuery
                  ? "No products matched your search. Try another keyword or clear the search filter."
                  : "You haven't listed any items yet. Start selling with AI titles and WhatsApp captions in 60 seconds."}
              </p>
              <Link
                to="/add-product"
                className="mt-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-label-sm font-bold shadow-xs hover:bg-neutral-800 transition-colors"
              >
                List Your First Item
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProducts.map((item) => {
                const isSelected = selectedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`bg-surface-container-lowest p-4 sm:p-5 rounded-DEFAULT border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? "border-[#25D366] shadow-[3px_3px_0px_#25D366]"
                        : "border-primary shadow-[2px_2px_0px_#000000] hover:shadow-[3px_3px_0px_#000000]"
                    }`}
                  >
                    {/* Checkbox + Image + Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.id)}
                        className="text-primary hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
                        title={isSelected ? "Deselect item" : "Select item for bulk sharing"}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {isSelected ? "check_box" : "check_box_outline_blank"}
                        </span>
                      </button>

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-DEFAULT object-cover border border-outline-variant shrink-0 bg-surface-container"
                      />

                      <div className="flex flex-col gap-1 min-w-0">
                        <Link
                          to={`/product/${item.slug || item.id}`}
                          className="text-headline-sm font-extrabold text-on-surface hover:underline truncate"
                        >
                          {item.name}
                        </Link>

                        <div className="flex items-center gap-2 text-body-sm flex-wrap">
                          <span className="font-extrabold text-primary">{item.price}</span>
                          <span className="text-on-surface-variant font-medium">• Floor: {item.floor}</span>
                          <span className="text-on-surface-variant font-medium hidden md:inline">
                            • {item.views} views
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              item.status === "In Escrow"
                                ? "bg-secondary-container text-on-secondary-container"
                                : "bg-surface-container-high text-on-surface"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View/Edit & Share to WhatsApp Button */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <Link
                        to={`/product/${item.slug || item.id}`}
                        className="px-3.5 py-2 rounded-full border-2 border-primary bg-surface-container-lowest text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
                      >
                        View / Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleShareSingle(item)}
                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:scale-[0.98]"
                        title="Share to WhatsApp Status or chats"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Bulk Action Bar (when items are selected) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 z-40 max-w-xl w-[92%] sm:w-auto left-1/2 -translate-x-1/2 bg-surface-container-lowest border-2 border-primary shadow-[6px_6px_0px_#000000] rounded-full p-2.5 px-5 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs font-black">
              {selectedIds.size}
            </span>
            <span className="text-body-sm font-extrabold text-on-surface hidden sm:inline">
              Items Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkShare}
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Share to WhatsApp ({selectedIds.size})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-on-surface-variant hover:text-on-surface px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Share Pop-up Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        items={itemsToShare}
        businessName={merchant.businessName || "My Kiosq"}
      />
    </div>
  );
}
