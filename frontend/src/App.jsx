import { BrowserRouter, Routes, Route, Link } from "react-router";
import LandingPage from "./pages/LandingPage";
import BuyerProductPage from "./pages/BuyerProductPage";
import AiNegotiationChat from "./pages/AiNegotiationChat";
import EscrowPaymentTracking from "./pages/EscrowPaymentTracking";
import SellerDashboard from "./pages/SellerDashboard";
import AddProduct from "./pages/AddProduct";

export default function App() {
  return (
    <BrowserRouter>
      {/* Dev / Presentation Screen Switcher Pill */}
      <aside
        aria-label="Screen Switcher"
        className="fixed top-2 right-2 z-50 bg-primary/90 text-on-primary text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md hidden sm:flex items-center gap-2"
      >
        <span className="font-bold text-secondary-container">Kiosq Flow:</span>
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span>•</span>
        <Link to="/product/ankara-wax" className="hover:underline">
          Storefront
        </Link>
        <span>•</span>
        <Link to="/haggle/ankara-wax" className="hover:underline">
          AI Chat
        </Link>
        <span>•</span>
        <Link to="/escrow/order-4821" className="hover:underline">
          Escrow
        </Link>
        <span>•</span>
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
      </aside>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product/:id" element={<BuyerProductPage />} />
        <Route path="/haggle/:id" element={<AiNegotiationChat />} />
        <Route path="/escrow/:orderId" element={<EscrowPaymentTracking />} />
        <Route path="/dashboard" element={<SellerDashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
      </Routes>
    </BrowserRouter>
  );
}
