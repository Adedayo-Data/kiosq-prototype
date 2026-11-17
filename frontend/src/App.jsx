import { BrowserRouter, Routes, Route } from "react-router";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/product/:id" element={<BuyerProductPage />} />
          <Route path="/haggle/:id" element={<AiNegotiationChat />} />
          <Route path="/escrow/:orderId" element={<EscrowPaymentTracking />} />
          <Route path="/handoff/:orderId" element={<PublicHandoffPage />} />

          {/* Protected Merchant Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <SellerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
