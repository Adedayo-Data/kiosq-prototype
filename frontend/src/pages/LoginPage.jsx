import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Store JWT token and merchant session in localStorage
      localStorage.setItem("kiosq_token", data.token);
      localStorage.setItem("kiosq_merchant", JSON.stringify(data));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center px-4 py-8">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

      <main className="w-full max-w-md relative z-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="inline-block">
            <img
              src="/kiosq-logo.png"
              alt="Kiosq - Chat Commerce"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight mt-2">
            Welcome back, Merchant
          </h1>
          <p className="text-body-sm text-on-surface-variant max-w-xs">
            Sign in with your email to manage your WhatsApp catalog, active escrow orders, and bank payouts.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-DEFAULT border-2 border-primary shadow-[4px_4px_0px_#000000] flex flex-col gap-5">
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-DEFAULT text-body-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="vendor@kiosq.africa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-3.5 pl-10 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-[20px] text-on-surface-variant">
                  mail
                </span>
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-label-sm text-on-surface-variant hover:underline font-semibold">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-3.5 pl-10 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-[20px] text-on-surface-variant">
                  lock
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 mt-2 bg-primary text-on-primary text-headline-sm font-bold rounded-full flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-neutral-800 transition-all cursor-pointer shadow-[2px_2px_0px_#000000] disabled:opacity-60"
            >
              <span>{loading ? "Signing in..." : "Sign In with Email"}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="bg-surface-container p-3 rounded-DEFAULT flex flex-col gap-1 text-xs text-on-surface-variant border border-surface-container-high">
            <span className="font-bold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">info</span>
              Demo Account (Seed Merchant):
            </span>
            <span>Email: <code className="font-mono font-bold text-primary">tola@kiosq.africa</code></span>
            <span>Password: <code className="font-mono font-bold text-primary">password123</code></span>
          </div>
        </div>

        {/* Switch to Signup */}
        <p className="text-center text-body-sm text-on-surface-variant">
          Don't have a Kiosq account yet?{" "}
          <Link to="/signup" className="font-bold text-on-surface underline underline-offset-4 hover:text-secondary">
            Open free Kiosq
          </Link>
        </p>
      </main>
    </div>
  );
}
