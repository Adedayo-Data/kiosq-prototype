import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router";
import { useToast } from "../context/ToastContext";

/**
 * ProtectedRoute guards merchant-only pages.
 * Redirects unauthenticated visitors to /login with a toast notification
 * and preserves their intended target route in the ?redirect= parameter.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { addToast } = useToast();
  const token = localStorage.getItem("kiosq_token");
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!token && !notifiedRef.current) {
      notifiedRef.current = true;
      addToast("Please sign in to access your merchant dashboard", "info", 8000);
    }
  }, [token, addToast]);

  if (!token) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
}
