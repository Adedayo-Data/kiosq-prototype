import { FALLBACK_ANKARA_IMAGE, FALLBACK_SNEAKERS_IMAGE, FALLBACK_BAG_IMAGE } from "./constants";

const STORAGE_KEY = "kiosq_orders_v1";

const DEFAULT_ORDERS = [
  {
    id: "ORD-4821",
    orderReference: "ORD-4821",
    itemTitle: "Authentic Ankara Wax Print (6 Yards)",
    imageUrl: FALLBACK_ANKARA_IMAGE,
    buyerFirstName: "Amina",
    buyerFullName: "Amina Bello",
    buyerPhone: "0803 456 7890",
    deliveryAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    amount: 28000,
    status: "In escrow", // "In escrow" | "Completed" | "Disputed" | "Refunded"
    deliveryStatus: "FUNDS_HELD_IN_ESCROW", // FUNDS_HELD_IN_ESCROW | DISPATCHED | PIN_VERIFIED | DELIVERED_AND_RELEASED | DISPUTED
    deliveryPin: "7429",
    date: "17 Nov 2026, 11:42 AM",
    dispatchedAt: null,
    packedItemPhoto: null,
    deliveredBy: null, // { type: "me"|"trusted"|"courier", name: "", phone: "" }
    inspectionHoursLeft: null,
    timeline: [
      { label: "Paid", completed: true, time: "17 Nov, 11:42 AM", note: "₦28,000 deposited in escrow" },
      { label: "Dispatched", completed: false, time: null, note: "Awaiting dispatch confirmation" },
      { label: "Delivered (PIN)", completed: false, time: null, note: "4-digit handoff PIN pending" },
      { label: "Inspection window", completed: false, time: null, note: "24-hour buyer inspection window" },
      { label: "Released", completed: false, time: null, note: "Payout disbursed to seller account" },
    ],
    dispute: null,
  },
  {
    id: "ORD-5192",
    orderReference: "ORD-5192",
    itemTitle: "Nike Air Jordan 1 High OG (Dropship)",
    imageUrl: FALLBACK_SNEAKERS_IMAGE,
    buyerFirstName: "Chidi",
    buyerFullName: "Chidi Okonkwo",
    buyerPhone: "0802 889 1234",
    deliveryAddress: "Block 4, 1004 Estate, Victoria Island, Lagos",
    amount: 65000,
    status: "In escrow",
    deliveryStatus: "DISPATCHED",
    deliveryPin: "5812",
    date: "17 Nov 2026, 09:15 AM",
    dispatchedAt: "17 Nov 2026, 10:00 AM",
    packedItemPhoto: null,
    deliveredBy: { type: "courier", name: "Gokada Logistics", phone: "0809 111 2233" },
    inspectionHoursLeft: null,
    timeline: [
      { label: "Paid", completed: true, time: "17 Nov, 09:15 AM", note: "₦65,000 deposited in escrow" },
      { label: "Dispatched", completed: true, time: "17 Nov, 10:00 AM", note: "With Gokada Logistics" },
      { label: "Delivered (PIN)", completed: false, time: null, note: "4-digit handoff PIN pending" },
      { label: "Inspection window", completed: false, time: null, note: "24-hour buyer inspection window" },
      { label: "Released", completed: false, time: null, note: "Payout disbursed to seller account" },
    ],
    dispute: null,
  },
  {
    id: "ORD-6204",
    orderReference: "ORD-6204",
    itemTitle: "Handcrafted Lagos Leather Tote",
    imageUrl: FALLBACK_BAG_IMAGE,
    buyerFirstName: "Zainab",
    buyerFullName: "Zainab Aliyu",
    buyerPhone: "0814 321 9876",
    deliveryAddress: "Plot 12, Wuse Zone 4, Abuja",
    amount: 34000,
    status: "In escrow",
    deliveryStatus: "FUNDS_HELD_IN_ESCROW",
    deliveryPin: "3190",
    date: "16 Nov 2026, 04:30 PM",
    dispatchedAt: null,
    packedItemPhoto: null,
    deliveredBy: null,
    inspectionHoursLeft: null,
    timeline: [
      { label: "Paid", completed: true, time: "16 Nov, 04:30 PM", note: "₦34,000 deposited in escrow" },
      { label: "Dispatched", completed: false, time: null, note: "Awaiting dispatch confirmation" },
      { label: "Delivered (PIN)", completed: false, time: null, note: "4-digit handoff PIN pending" },
      { label: "Inspection window", completed: false, time: null, note: "24-hour buyer inspection window" },
      { label: "Released", completed: false, time: null, note: "Payout disbursed to seller account" },
    ],
    dispute: null,
  },
  {
    id: "ORD-7319",
    orderReference: "ORD-7319",
    itemTitle: "Silk Boubou Gown with Embroidery",
    imageUrl: FALLBACK_ANKARA_IMAGE,
    buyerFirstName: "Folake",
    buyerFullName: "Folake Johnson",
    buyerPhone: "0805 777 4433",
    deliveryAddress: "22 Allen Avenue, Ikeja, Lagos",
    amount: 42000,
    status: "Completed",
    deliveryStatus: "DELIVERED_AND_RELEASED",
    deliveryPin: "9041",
    date: "15 Nov 2026, 02:10 PM",
    dispatchedAt: "15 Nov 2026, 02:40 PM",
    packedItemPhoto: null,
    deliveredBy: { type: "me", name: "Mama Tola (Direct)", phone: "0801 234 5678" },
    inspectionHoursLeft: 0,
    timeline: [
      { label: "Paid", completed: true, time: "15 Nov, 02:10 PM", note: "₦42,000 deposited in escrow" },
      { label: "Dispatched", completed: true, time: "15 Nov, 02:40 PM", note: "Delivered directly by seller" },
      { label: "Delivered (PIN)", completed: true, time: "15 Nov, 03:55 PM", note: "PIN verified at doorstep" },
      { label: "Inspection window", completed: true, time: "16 Nov, 03:55 PM", note: "24-hour inspection elapsed" },
      { label: "Released", completed: true, time: "16 Nov, 03:55 PM", note: "₦42,000 sent to Access Bank" },
    ],
    dispute: null,
  },
  {
    id: "ORD-8450",
    orderReference: "ORD-8450",
    itemTitle: "Embroidered Senator Fabric (4 Yards)",
    imageUrl: FALLBACK_ANKARA_IMAGE,
    buyerFirstName: "Emeka",
    buyerFullName: "Emeka Nwosu",
    buyerPhone: "0806 999 1122",
    deliveryAddress: "7 Toyin Street, Ikeja, Lagos",
    amount: 38000,
    status: "Completed",
    deliveryStatus: "DELIVERED_AND_RELEASED",
    deliveryPin: "4421",
    date: "14 Nov 2026, 01:25 PM",
    dispatchedAt: "14 Nov 2026, 02:00 PM",
    packedItemPhoto: null,
    deliveredBy: { type: "trusted", name: "Segun (Brother)", phone: "0803 112 3344" },
    inspectionHoursLeft: 0,
    timeline: [
      { label: "Paid", completed: true, time: "14 Nov, 01:25 PM", note: "₦38,000 deposited in escrow" },
      { label: "Dispatched", completed: true, time: "14 Nov, 02:00 PM", note: "With Segun" },
      { label: "Delivered (PIN)", completed: true, time: "14 Nov, 03:10 PM", note: "PIN verified at doorstep" },
      { label: "Inspection window", completed: true, time: "15 Nov, 03:10 PM", note: "24-hour inspection elapsed" },
      { label: "Released", completed: true, time: "15 Nov, 03:10 PM", note: "₦38,000 sent to Access Bank" },
    ],
    dispute: null,
  },
];

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Fallback
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
  return DEFAULT_ORDERS;
}

export function saveStoredOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {}
}

export function getOrderById(idOrRef) {
  const orders = getStoredOrders();
  return orders.find(
    (o) => o.id === idOrRef || o.orderReference === idOrRef || o.id === `ORD-${idOrRef}`
  ) || orders[0];
}

export function updateOrder(idOrRef, updates) {
  const orders = getStoredOrders();
  const idx = orders.findIndex(
    (o) => o.id === idOrRef || o.orderReference === idOrRef || o.id === `ORD-${idOrRef}`
  );
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...updates };
    saveStoredOrders(orders);
    return orders[idx];
  }
  return null;
}
