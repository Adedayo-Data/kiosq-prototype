import { Link } from "react-router";

export default function TopBar() {
  return (
    <header className="w-full flex items-center justify-between py-3 border-b border-surface-container-high/60 md:border-none">
      {/* Location guarantee badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container">
        <span className="material-symbols-outlined text-[16px]">verified_user</span>
        <span className="text-label-sm uppercase tracking-wider font-bold">
          Lekki • Yaba • Abuja
        </span>
      </div>

      {/* Desktop Quick Nav */}
      <nav className="hidden md:flex items-center gap-6 text-label-md font-semibold text-on-surface-variant">
        <a href="#features" className="hover:text-on-surface transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="hover:text-on-surface transition-colors">
          How It Works
        </a>
        <a href="#merchants" className="hover:text-on-surface transition-colors">
          Merchants
        </a>
        <a href="#escrow" className="hover:text-on-surface transition-colors">
          Dual Escrow
        </a>
      </nav>

      {/* Auth Actions (Login / Signup) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-label-sm font-semibold">Live System</span>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-on-surface hover:text-neutral-600 px-3 py-1.5 text-label-sm font-bold transition-colors cursor-pointer"
        >
          <span>Sign In</span>
        </Link>

        <Link
          to="/signup"
          className="inline-flex items-center gap-1 bg-primary text-on-primary px-4 py-1.5 rounded-full text-label-sm font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
        >
          <span>Open Kiosq</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>
    </header>
  );
}
