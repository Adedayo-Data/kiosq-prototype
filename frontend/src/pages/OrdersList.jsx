import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { getStoredOrders } from "../utils/orderStorage";
import KiosqLogo from "../components/KiosqLogo";

export default function OrdersList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("awaiting-pin");
  const orders = useMemo(() => getStoredOrders(), []);

  const awaitingPinCount = orders.filter(
    (o) => o.status === "In escrow" && o.deliveryStatus !== "DELIVERED_AND_RELEASED"
  ).length;

  const filteredOrders = useMemo(() => {
    if (filter === "awaiting-pin") {
      return orders.filter(
        (o) => o.status === "In escrow" && o.deliveryStatus !== "DELIVERED_AND_RELEASED"
      );
    }
    if (filter === "all") return orders;
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
                <KiosqLogo className="h-10 sm:h-12 w-auto" />
              </Link>
            </div>

            <Link
              to="/transactions"
              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-surface hover:text-neutral-600 transition-colors bg-surface-container px-3 py-1.5 rounded-full"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>All Transactions</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight">
                Escrow Orders &amp; Delivery PINs
              </h1>
              <span className="bg-amber-100 text-amber-900 text-label-sm font-bold px-2.5 py-0.5 rounded-full">
                {awaitingPinCount} Awaiting PIN
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Manage physical doorstep delivery, dispatch assignments, and 4-digit PIN handoffs.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilter("awaiting-pin")}
              className={`px-3.5 py-1.5 rounded-full text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
                filter === "awaiting-pin"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              Awaiting Delivery PIN ({awaitingPinCount})
            </button>

            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
                filter === "all"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              All Orders ({orders.length})
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={`px-3.5 py-1.5 rounded-full text-label-sm font-bold transition-all shrink-0 cursor-pointer ${
                filter === "completed"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              Delivered &amp; Released
            </button>
          </div>

          {/* Orders Cards List */}
          <div className="flex flex-col gap-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-surface-container-lowest p-10 rounded-DEFAULT border-2 border-dashed border-outline-variant text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">package_2</span>
                <span className="text-headline-sm font-bold text-on-surface">No orders in this view</span>
                <p className="text-body-sm text-on-surface-variant max-w-xs">
                  All your customer orders and delivery handoffs will appear here.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-surface-container-lowest p-4 sm:p-5 rounded-DEFAULT border-2 border-primary/20 hover:border-primary shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <img
                      src={order.imageUrl}
                      alt={order.itemTitle}
                      className="w-16 h-16 rounded-md object-cover shrink-0 border border-outline-variant bg-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface">
                          {order.orderReference}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            order.deliveryStatus === "FUNDS_HELD_IN_ESCROW"
                              ? "bg-amber-100 text-amber-900"
                              : order.deliveryStatus === "DISPATCHED"
                              ? "bg-blue-100 text-blue-900"
                              : order.deliveryStatus === "DELIVERED_AND_RELEASED"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-error/15 text-error"
                          }`}
                        >
                          {order.deliveryStatus === "FUNDS_HELD_IN_ESCROW"
                            ? "Awaiting Dispatch"
                            : order.deliveryStatus === "DISPATCHED"
                            ? "Out for Delivery"
                            : order.deliveryStatus === "DELIVERED_AND_RELEASED"
                            ? "Delivered & Released"
                            : "Disputed"}
                        </span>
                      </div>

                      <span className="text-headline-sm font-bold text-on-surface truncate group-hover:underline mt-1">
                        {order.itemTitle}
                      </span>

                      <div className="flex flex-wrap items-center gap-x-2 text-body-sm text-on-surface-variant mt-0.5">
                        <span className="font-semibold text-on-surface">Buyer: {order.buyerFullName}</span>
                        <span>•</span>
                        <span className="truncate max-w-xs">{order.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-container-high">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-headline-md font-extrabold text-on-surface">
                        ₦{order.amount.toLocaleString()}
                      </span>
                      <span className="text-label-sm font-bold text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        In Escrow
                      </span>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-primary text-on-primary text-label-sm font-bold flex items-center gap-1 group-hover:bg-neutral-800 transition-colors shadow-xs"
                    >
                      <span>Handoff</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
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
