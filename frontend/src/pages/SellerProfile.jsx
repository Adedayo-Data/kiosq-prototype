import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useToast } from "../context/ToastContext";
import { getStoredOrders } from "../utils/orderStorage";
import KiosqLogo from "../components/KiosqLogo";

export default function SellerProfile() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [merchant, setMerchant] = useState(null);
  const orders = getStoredOrders();

  useEffect(() => {
    const stored = localStorage.getItem("kiosq_merchant");
    if (stored) {
      try {
        setMerchant(JSON.parse(stored));
      } catch (e) { }
    }
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + (o.status !== "Refunded" ? o.amount : 0), 0);
  const dealsClosed = orders.filter((o) => o.status === "Completed").length;

  const handleLogout = () => {
    localStorage.removeItem("kiosq_token");
    localStorage.removeItem("kiosq_merchant");
    addToast("Logged out successfully.", "info", 5000);
    navigate("/login");
  };

  const businessName = merchant?.businessName || "Mama Tola Textiles";
  const fullName = merchant?.fullName || "Chioma Adeleke";
  const location = merchant?.marketLocation || "Balogun Market, Lagos Island";
  const phone = merchant?.phone || "0801 234 5678";
  const bankName = merchant?.bankName || "Access Bank";
  const rawAccount = merchant?.accountNumber || "0123456789";
  const maskedAccount = `${bankName} •••• ${rawAccount.slice(-4)}`;
  const memberSince = "November 2026";

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-2xl px-4 sm:px-6 py-6 pb-24">
        <div className="flex flex-col gap-6 w-full">
          {/* Top Bar Navigation */}
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

            <Link
              to="/transactions"
              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors bg-surface-container px-3 py-1.5 rounded-full"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Transactions</span>
            </Link>
          </div>

          {/* Profile Card Header */}
          <div className="bg-surface-container-lowest p-6 rounded-DEFAULT border-2 border-primary shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-2xl font-black shrink-0 shadow-xs">
                {businessName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-headline-md font-extrabold text-on-surface truncate">
                    {businessName}
                  </h1>
                  <span
                    className="inline-flex items-center gap-0.5 bg-secondary-container text-on-secondary-container text-label-sm px-2 py-0.5 rounded-full font-bold shrink-0"
                    title="Verified Kiosq Social Merchant"
                  >
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Verified</span>
                  </span>
                </div>
                <span className="text-body-sm text-on-surface-variant font-medium mt-0.5">
                  {fullName} • Member since {memberSince}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 bg-surface-container text-error hover:bg-error/10 px-4 py-2 rounded-full text-label-sm font-bold transition-colors cursor-pointer shrink-0 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
          </div>

          {/* Contact & Settlement Details Card */}
          <div className="bg-surface-container-lowest p-5 rounded-DEFAULT border-2 border-primary/20 shadow-xs flex flex-col gap-4">
            <h2 className="text-label-md font-bold text-on-surface uppercase tracking-wider">
              Merchant Information &amp; Payout Account
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-DEFAULT border border-outline-variant/30">
                <span className="text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Market Location
                </span>
                <span className="text-body-md font-bold text-on-surface">
                  {location}
                </span>
              </div>

              <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-DEFAULT border border-outline-variant/30">
                <span className="text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  Registered WhatsApp Phone
                </span>
                <span className="text-body-md font-bold text-on-surface">
                  {phone}
                </span>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1 p-3 bg-surface-container-low rounded-DEFAULT border border-outline-variant/30">
                <span className="text-label-sm text-on-surface-variant font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  Masked Payout Bank Account (3-minute automated wire)
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-body-md font-mono font-bold text-on-surface">
                    {maskedAccount}
                  </span>
                  <span className="text-label-sm text-secondary font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Secured
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card with 3 Stats & Link to Transactions */}
          <div className="bg-surface-container-lowest p-5 rounded-DEFAULT border-2 border-primary shadow-[2px_2px_0px_#000000] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-sm font-bold text-on-surface">
                Store Performance Summary
              </h2>
              <span className="text-label-sm text-secondary font-bold bg-secondary-container px-2.5 py-0.5 rounded-full">
                Active Ledger
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-0.5 p-3 bg-surface-container rounded-DEFAULT">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase">Total Sales</span>
                <span className="text-headline-sm font-extrabold text-on-surface truncate">
                  ₦{totalSales.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 p-3 bg-surface-container rounded-DEFAULT">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase">Deals Closed</span>
                <span className="text-headline-sm font-extrabold text-on-surface">
                  {dealsClosed}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 p-3 bg-surface-container rounded-DEFAULT">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase">Settlement Speed</span>
                <span className="text-headline-sm font-extrabold text-secondary truncate">
                  &lt; 3 mins
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              <Link
                to="/transactions"
                className="w-full h-12 rounded-full bg-primary text-on-primary text-label-md font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                <span>View all transactions</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <Link
                to="/products"
                className="w-full h-11 rounded-full border-2 border-primary bg-surface-container-lowest text-on-surface hover:bg-surface-container text-label-md font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                <span>Manage & Bulk Share Products</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
