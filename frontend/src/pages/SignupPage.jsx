import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import KiosqLogo from "../components/KiosqLogo";

export default function SignupPage() {
  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem("kiosq_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    marketLocation: "Balogun Market, Lagos Island",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register merchant account.");
      }

      localStorage.setItem("kiosq_token", data.token);
      localStorage.setItem("kiosq_merchant", JSON.stringify(data));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center px-4 py-8">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

      <main className="w-full max-w-lg relative z-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <KiosqLogo className="h-12 w-auto" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold uppercase mt-1">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Takes Less than 60 Seconds</span>
          </div>
          <h1 className="text-headline-lg sm:text-[30px] font-extrabold text-on-surface tracking-tight mt-1">
            Open Your Free Kiosq
          </h1>
          <p className="text-body-sm text-on-surface-variant max-w-md">
            Start selling on WhatsApp with automated AI price negotiation, dual-protection escrow, and instant bank payouts.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-DEFAULT border-2 border-primary shadow-[4px_4px_0px_#000000] flex flex-col gap-5">
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-DEFAULT text-body-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name & Business Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Chioma Adeleke"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  Store / Brand Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  placeholder="e.g. Mama Tola Textiles"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Email (Required for login) & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="vendor@kiosq.africa"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  WhatsApp Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="08012345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Location & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  City / Market Location
                </label>
                <input
                  type="text"
                  name="marketLocation"
                  required
                  placeholder="e.g. Yaba / Balogun, Lagos"
                  value={formData.marketLocation}
                  onChange={handleChange}
                  className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 px-3.5 rounded-DEFAULT bg-surface-container-low border-2 border-primary text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 mt-2 bg-primary text-on-primary text-headline-sm font-bold rounded-full flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-neutral-800 transition-all cursor-pointer shadow-[2px_2px_0px_#000000] disabled:opacity-60"
            >
              <span>{loading ? "Creating your Kiosq..." : "Create Free Kiosq Account"}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Micro Trust Strip */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-container-high font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
              0% Setup Fee
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
              No monthly charges
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
              CBN partner rails
            </span>
          </div>
        </div>

        {/* Switch to Login */}
        <p className="text-center text-body-sm text-on-surface-variant">
          Already running a Kiosq?{" "}
          <Link to="/login" className="font-bold text-on-surface underline underline-offset-4 hover:text-secondary">
            Sign in here
          </Link>
        </p>
      </main>
    </div>
  );
}
