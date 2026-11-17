import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { getStoredOrders } from "../utils/orderStorage";
import KiosqLogo from "../components/KiosqLogo";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const orders = useMemo(() => getStoredOrders(), []);

  // Compute stats dynamically from orders
  const stats = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === "Completed");
    const inEscrowOrders = orders.filter((o) => o.status === "In escrow");
    const disputedOrders = orders.filter((o) => o.status === "Disputed");
    const refundedOrders = orders.filter((o) => o.status === "Refunded");

    const totalSales = orders.reduce((sum, o) => sum + (o.status !== "Refunded" ? o.amount : 0), 0);
    const totalPaidOut = completedOrders.reduce((sum, o) => sum + o.amount, 0);
    const disputeRate = orders.length > 0 ? ((disputedOrders.length / orders.length) * 100).toFixed(1) : "0.0";

    return {
      dealsCompleted: completedOrders.length,
      totalSales,
      disputeRate,
      totalPaidOut,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());
  }, [orders, filter]);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-4xl px-4 sm:px-6 py-6 pb-24">
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
                <KiosqLogo className="h-8 w-auto" />
              </Link>
            </div>

            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors bg-surface-container px-3 py-1.5 rounded-full"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              <span>Seller Profile</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
              Transactions &amp; Escrow Ledger
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              Every verified sale, active escrow deposit, and completed payout.
            </p>
          </div>

          {/* Top Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Deals Completed */}
            <div className="bg-surface-container-lowest p-4 rounded-DEFAULT border-2 border-primary shadow-[2px_2px_0px_#000000] flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Deals Completed
              </span>
              <span className="text-headline-lg font-extrabold text-on-surface">
                {stats.dealsCompleted}
              </span>
              <span className="text-xs text-secondary font-bold flex items-center gap-0.5 mt-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                PIN verified
              </span>
            </div>

            {/* Total Sales */}
            <div className="bg-surface-container-lowest p-4 rounded-DEFAULT border-2 border-primary shadow-[2px_2px_0px_#000000] flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Total Sales
              </span>
              <span className="text-headline-lg font-extrabold text-on-surface truncate">
                ₦{stats.totalSales.toLocaleString()}
              </span>
              <span className="text-xs text-on-surface-variant font-medium mt-1">
                All social orders
              </span>
            </div>

            {/* Dispute Rate */}
            <div className="bg-surface-container-lowest p-4 rounded-DEFAULT border-2 border-primary shadow-[2px_2px_0px_#000000] flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Dispute Rate
              </span>
              <span className="text-headline-lg font-extrabold text-secondary">
                {stats.disputeRate}%
              </span>
              <span className="text-xs text-secondary font-bold flex items-center gap-0.5 mt-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified low risk
              </span>
            </div>

            {/* Total Paid Out */}
            <div className="bg-surface-container-lowest p-4 rounded-DEFAULT border-2 border-primary shadow-[2px_2px_0px_#000000] flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Total Paid Out
              </span>
              <span className="text-headline-lg font-extrabold text-on-surface truncate">
                ₦{stats.totalPaidOut.toLocaleString()}
              </span>
              <span className="text-xs text-on-surface-variant font-medium mt-1 truncate">
                Direct to bank
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["All", "In escrow", "Completed", "Disputed", "Refunded"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
                  filter === tab
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="flex flex-col gap-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-surface-container-lowest p-10 rounded-DEFAULT border-2 border-dashed border-outline-variant text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">receipt_long</span>
                <span className="text-headline-sm font-bold text-on-surface">No transactions found</span>
                <p className="text-body-sm text-on-surface-variant max-w-xs">
                  There are currently no transactions matching "{filter}".
                </p>
              </div>
            ) : (
              filteredOrders.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/orders/${item.id}`)}
                  className="bg-surface-container-lowest p-4 rounded-DEFAULT border-2 border-primary/20 hover:border-primary shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={item.imageUrl}
                      alt={item.itemTitle}
                      className="w-14 h-14 rounded-md object-cover shrink-0 border border-outline-variant bg-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-lg font-bold text-on-surface truncate group-hover:underline">
                        {item.itemTitle}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-body-sm text-on-surface-variant mt-0.5">
                        <span className="font-semibold text-on-surface">Buyer: {item.buyerFirstName}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container-high">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-headline-sm font-extrabold text-on-surface">
                        ₦{item.amount.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-mono text-on-surface-variant">
                        {item.orderReference}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-label-sm font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          item.status === "Completed"
                            ? "bg-secondary-container text-on-secondary-container"
                            : item.status === "In escrow"
                            ? "bg-amber-100 text-amber-900"
                            : item.status === "Disputed"
                            ? "bg-error/15 text-error"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {item.status}
                      </span>

                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                        chevron_right
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
