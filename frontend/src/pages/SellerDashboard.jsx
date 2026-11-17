import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("kiosq_merchant");
    if (stored) {
      try {
        setMerchant(JSON.parse(stored));
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kiosq_token");
    localStorage.removeItem("kiosq_merchant");
    navigate("/login");
  };

  const products = [
    {
      id: 1,
      name: "Vibrant Ankara Wax Fabric (6 Yards)",
      price: "₦28,000",
      floor: "₦23,000",
      status: "In Escrow",
      views: 312,
      offers: 5,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCBX-u9wryLR56yDqXiQu3bprUb7DT2qXKe4wlyxQqhfRjBtNDiLASybetYqLudyEyxtDK-sheSgmIE5mDbWioeoxc3OZTGL31pG32E6E4mEI1Cf2YTexWBVJLt2BizO_GB_-ZKYNCRHgTVDlfimMrfHnWbVrYMxjw05hgGX5fmk66NBuve_lFGVuQB3auf3tHAnijR7fYfehoj4gSFZnkGIr8yRgGm0XMX8NwDO1-n",
    },
    {
      id: 2,
      name: "Nike Air Jordan 1 High OG (Dropship)",
      price: "₦65,000",
      floor: "₦58,000",
      status: "Plug Locked",
      views: 520,
      offers: 12,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDCmkOTf2Gi6WDBUDsF9jh5Bm8p1mpdjAWTrenu6lhZ2knb1RZga7L913-QANPu_Aox4kq-aa3rygZLLOvOdK48MImMt88CN3D-yC1IleipBYtXwlQXYnpWwU_RfpkZ-Xq7H98UQCRsDDdapHalEW4ppP5GV745cCobx5RsGWN-LNxGPBKqAb4Rn3eIuHpI0Z-yb4XeS-HkIc0S1898uDkibmN2nxznGb-CK-AZ6x8D",
    },
    {
      id: 3,
      name: "Handcrafted Lagos Leather Tote",
      price: "₦34,000",
      floor: "₦29,000",
      status: "Active",
      views: 184,
      offers: 3,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAKJfLOn4VRMScTfJqlEtJ9M39g70YXxZSSZ_RABRROV5nCaPrT3yV6Wq_Vl8zH-V3eJ4P-L1-mN3cZ4w-yC1IleipBYtXwlQXYnpWwU_RfpkZ-Xq7H98UQCRsDDdapHalEW4ppP5GV745cCobx5RsGWN-LNxGPBKqAb4Rn3eIuHpI0Z-yb4XeS-HkIc0S1898uDkibmN2nxznGb-CK-AZ6x8D",
    },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="flex flex-col gap-6 w-full">
          {/* Top Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center text-lg font-bold shadow-xs">
                {merchant?.businessName ? merchant.businessName.charAt(0).toUpperCase() : "M"}
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm text-on-surface-variant font-bold">
                  {merchant?.businessName || "Mama Tola Textiles"}
                </span>
                <h1 className="text-headline-lg font-extrabold text-on-surface">
                  E kaabo, {merchant?.fullName || "Chioma"} 👋
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/add-product"
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2.5 rounded-full text-label-md font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>List Item</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 bg-surface-container text-on-surface hover:bg-surface-container-high px-3.5 py-2.5 rounded-full text-label-sm font-bold transition-colors cursor-pointer"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
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
                ₦148,500
              </span>
              <span className="text-label-sm text-secondary font-bold flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">account_balance</span>
                Direct to Access Bank
              </span>
            </div>

            {/* In Escrow */}
            <div className="bg-surface-container-lowest p-5 rounded-DEFAULT shadow-[2px_2px_0px_#000000] border-2 border-primary flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant font-bold uppercase">
                Locked In Escrow
              </span>
              <span className="text-[28px] font-extrabold text-secondary tracking-tight">
                ₦74,000
              </span>
              <span className="text-label-sm text-on-surface-variant font-medium">
                3 orders awaiting delivery PIN
              </span>
            </div>

            {/* AI Deals Closed */}
            <div className="bg-surface-container-lowest p-5 rounded-DEFAULT shadow-[2px_2px_0px_#000000] border-2 border-primary flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant font-bold uppercase">
                AI Haggler Auto-Closes
              </span>
              <span className="text-[28px] font-extrabold text-on-surface tracking-tight">
                19 Deals
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
                    className={`px-3 py-1 rounded-full capitalize transition-all cursor-pointer ${
                      filter === f
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
            <div className="flex flex-col gap-3">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest p-4 rounded-DEFAULT shadow-xs border-2 border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-headline-sm text-on-surface font-bold">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3 text-body-sm text-on-surface-variant mt-0.5">
                        <span className="font-bold text-on-surface">{item.price}</span>
                        <span>• Floor: {item.floor}</span>
                        <span>• {item.views} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-label-sm font-bold px-2.5 py-1 rounded-full ${
                        item.status === "In Escrow"
                          ? "bg-secondary-container text-on-secondary-container"
                          : item.status === "Plug Locked"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-surface-container-high text-on-surface"
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      onClick={() => alert(`Copied WhatsApp share card for: ${item.name}`)}
                      className="inline-flex items-center gap-1 bg-[#25D366] text-white text-label-sm font-bold px-3 py-1.5 rounded-full hover:bg-[#1ebd59] transition-colors cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">share</span>
                      <span>Status</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
