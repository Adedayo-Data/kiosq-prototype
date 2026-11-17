import { BrowserRouter, Routes, Route } from "react-router";
import { ToastProvider } from "./context/ToastContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BuyerProductPage from "./pages/BuyerProductPage";
import AiNegotiationChat from "./pages/AiNegotiationChat";
import EscrowPaymentTracking from "./pages/EscrowPaymentTracking";
import SellerDashboard from "./pages/SellerDashboard";
import AddProduct from "./pages/AddProduct";
import TransactionsPage from "./pages/TransactionsPage";
import SellerProfile from "./pages/SellerProfile";
import OrdersList from "./pages/OrdersList";
import OrderDetail from "./pages/OrderDetail";
import PublicHandoffPage from "./pages/PublicHandoffPage";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/product/:id" element={<BuyerProductPage />} />
          <Route path="/haggle/:id" element={<AiNegotiationChat />} />
          <Route path="/escrow/:orderId" element={<EscrowPaymentTracking />} />
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/profile" element={<SellerProfile />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/handoff/:orderId" element={<PublicHandoffPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
