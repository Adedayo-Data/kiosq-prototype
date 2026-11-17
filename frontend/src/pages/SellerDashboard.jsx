import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useToast } from "../context/ToastContext";
import KiosqLogo from "../components/KiosqLogo";
import {
  FALLBACK_ANKARA_IMAGE,
  FALLBACK_SNEAKERS_IMAGE,
  FALLBACK_BAG_IMAGE,
  API_BASE_URL,
} from "../utils/constants";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    availableBalance: "148,500",
    escrowLocked: "74,000",
    escrowOrdersCount: 3,
    aiDealsCount: 19,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fallbackProducts = [
    {
      id: 1,
      slug: "vibrant-ankara-wax",
      name: "Vibrant Ankara Wax Fabric (6 Yards)",
      price: "₦28,000",
      floor: "₦23,000",
      status: "In Escrow",
      views: 312,
      offers: 5,
      image: FALLBACK_ANKARA_IMAGE,
      whatsappCaption: "Vibrant Ankara Wax Fabric (6 Yards) - ₦28,000. Order safely with Kiosq escrow protection!",
    },
    {
      id: 2,
      slug: "nike-air-jordan-1-dropship",
      name: "Nike Air Jordan 1 High OG (Dropship)",
      price: "₦65,000",
      floor: "₦58,000",
      status: "Plug Locked",
      views: 520,
      offers: 12,
      image: FALLBACK_SNEAKERS_IMAGE,
      whatsappCaption: "Nike Air Jordan 1 High OG - ₦65,000. Order safely with Kiosq escrow protection!",
    },
    {
      id: 3,
      slug: "lagos-leather-tote",
      name: "Handcrafted Lagos Leather Tote",
      price: "₦34,000",
      floor: "₦29,000",
      status: "Active",
      views: 184,
      offers: 3,
      image: FALLBACK_BAG_IMAGE,
      whatsappCaption: "Handcrafted Lagos Leather Tote - ₦34,000. Order safely with Kiosq escrow protection!",
    },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("kiosq_merchant");
    if (stored) {
      try {
        setMerchant(JSON.parse(stored));
      } catch (e) {
        // Fallback
      }
    }

    const token = localStorage.getItem("kiosq_token");

    // Fetch Products from Backend (tries /products and fallback /merchant/products)
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
            setProducts(mapped);
            return;
          }
        }
        setProducts(fallbackProducts);
      } catch (err) {
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();

    // Fetch Metrics if authenticated
    if (token) {
      fetch(`${API_BASE_URL}/api/v1/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setMetrics({
              availableBalance: Number(data.availableBalance || 148500).toLocaleString(),
              escrowLocked: Number(data.escrowLocked || 74000).toLocaleString(),
              escrowOrdersCount: data.escrowOrdersCount || 3,
              aiDealsCount: data.aiDealsClosed || 19,
            });
          }
        })
        .catch(() => { });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kiosq_token");
    localStorage.removeItem("kiosq_merchant");
    addToast("You have been signed out successfully.", "info", 5000);
    navigate("/login");
  };

  const handleShareProduct = (item) => {
    const productUrl = `${window.location.origin}/product/${item.slug || item.id}`;
    const textToCopy = item.whatsappCaption
      ? `${item.whatsappCaption}\n\n👉 Pay or Haggle Safely: ${productUrl}`
      : `🔥 ${item.name} • ${item.price}\nProtected by Kiosq Escrow: ${productUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      addToast(
        `Copied WhatsApp post for "${item.name}"! Paste directly to your WhatsApp Status or DM.`,
        "success",
        10000
      );
    } else {
      addToast(
        `Share link: ${productUrl}`,
        "info",
        10000
      );
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === "escrow") return p.status === "In Escrow";
    if (filter === "active") return p.status === "Active";
    return true;
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="flex flex-col gap-6 w-full">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
              <KiosqLogo className="h-9 sm:h-10 w-auto" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-label-sm font-bold transition-colors cursor-pointer"
                title="View Transactions"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span className="hidden sm:inline">Transactions</span>
              </Link>

              <Link
                to="/add-product"
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-label-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>List Item</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 bg-surface-container text-on-surface hover:bg-surface-container-high px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-label-sm font-bold transition-colors cursor-pointer"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Welcome Merchant Strip */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center text-lg font-bold shadow-xs hover:ring-2 hover:ring-primary hover:scale-105 transition-all cursor-pointer shrink-0"
                title="View Seller Profile"
              >
                {merchant?.businessName ? merchant.businessName.charAt(0).toUpperCase() : "M"}
              </Link>
              <div className="flex flex-col">
                <Link
                  to="/profile"
                  className="text-label-sm text-on-surface-variant font-bold hover:underline"
                >
                  {merchant?.businessName || "Mama Tola Textiles"}
                </Link>
                <h1 className="text-headline-lg font-extrabold text-on-surface">
                  E kaabo, {merchant?.fullName || "Chioma"} 👋
                </h1>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Balance */}
            <div className="bg-surface-container-lowest p-5 rounded-DEFAULT shadow-[2px_2px_0px_#000000] border-2 border-primary flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant font-bold uppercase">
                Available Payout
              </span>
              <span className="text-[28px] font-extrabold text-on-surface tracking-tight">
                ₦{metrics.availableBalance}
              </span>
              <span className="text-label-sm text-secondary font-bold flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">account_balance</span>
                Direct to {merchant?.bankName || "Access Bank"}
              </span>
            </div>

            {/* In Escrow: Clicking opens Orders List (Requirement 4) */}
            <Link
              to="/orders"
              className="bg-surface-container-lowest p-5 rounded-DEFAULT shadow-[2px_2px_0px_#000000] border-2 border-primary flex flex-col gap-1 hover:border-secondary transition-all cursor-pointer group"
              title="View Escrow Orders & Delivery PINs"
            >
              <div className="flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant font-bold uppercase">
                  Locked In Escrow
                </span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-secondary group-hover:translate-x-0.5 transition-all">
                  arrow_forward
                </span>
              </div>
              <span className="text-[28px] font-extrabold text-secondary tracking-tight">
                ₦{metrics.escrowLocked}
              </span>
              <span className="text-label-sm text-secondary font-bold flex items-center gap-1 mt-1 group-hover:underline">
                <span className="material-symbols-outlined text-[15px]">pin</span>
                <span>{metrics.escrowOrdersCount} orders awaiting delivery PIN</span>
              </span>
            </Link>

            {/* AI Deals Closed */}
            <div className="bg-surface-container-lowest p-5 rounded-DEFAULT shadow-[2px_2px_0px_#000000] border-2 border-primary flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant font-bold uppercase">
                AI Haggler Auto-Closes
              </span>
              <span className="text-[28px] font-extrabold text-on-surface tracking-tight">
                {metrics.aiDealsCount} Deals
              </span>
              <span className="text-label-sm text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full w-fit font-bold">
                100% floor preserved
              </span>
            </div>
          </div>

          {/* Product Catalog Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-md font-extrabold text-on-surface">Your Products</h2>
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full text-label-sm font-bold">
                {["all", "escrow", "active"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full capitalize transition-all cursor-pointer ${filter === f
                      ? "bg-primary text-on-primary"
                      : "text-on-surface hover:text-neutral-600"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List */}
            {isLoading ? (
              <div className="p-8 text-center text-body-md text-on-surface-variant font-medium">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-DEFAULT flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">inventory_2</span>
                <span className="text-headline-sm font-bold text-on-surface">No products listed yet</span>
                <Link
                  to="/add-product"
                  className="bg-primary text-on-primary px-5 py-2.5 rounded-full text-label-md font-bold mt-2"
                >
                  Upload Your First Products
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest p-4 rounded-DEFAULT shadow-xs border-2 border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary transition-all"
                  >
                    <Link
                      to={`/product/${item.slug || item.id}`}
                      className="flex items-center gap-3 group flex-1"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-md object-cover shrink-0 border border-outline-variant"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_ANKARA_IMAGE;
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-headline-sm text-on-surface font-bold group-hover:underline">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-3 text-body-sm text-on-surface-variant mt-0.5">
                          <span className="font-bold text-on-surface">{item.price}</span>
                          <span>• Floor: {item.floor}</span>
                          <span>• {item.views} views</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-label-sm font-bold px-2.5 py-1 rounded-full ${item.status === "In Escrow"
                          ? "bg-secondary-container text-on-secondary-container"
                          : item.status === "Plug Locked"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-surface-container-high text-on-surface"
                          }`}
                      >
                        {item.status}
                      </span>

                      <button
                        onClick={() => handleShareProduct(item)}
                        className="inline-flex items-center gap-1 bg-[#25D366] text-white text-label-sm font-bold px-3 py-1.5 rounded-full hover:bg-[#1ebd59] transition-colors cursor-pointer shadow-xs"
                        title="Copy WhatsApp share text and link"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                        <span>Status</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
