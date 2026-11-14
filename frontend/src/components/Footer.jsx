export default function Footer() {
  return (
    <footer className="w-full flex flex-col gap-6 pt-6 pb-8 border-t border-surface-container-high text-on-surface-variant">
      {/* Fast Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-label-md text-on-surface font-semibold">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <a className="hover:underline hover:text-primary transition-colors" href="#terms">
            Seller Terms
          </a>
          <a className="hover:underline hover:text-primary transition-colors" href="#escrow">
            Buyer Escrow
          </a>
          <a className="hover:underline hover:text-primary transition-colors" href="#privacy">
            Privacy Policy
          </a>
          <a className="hover:underline hover:text-primary transition-colors" href="#support">
            Support WhatsApp
          </a>
        </div>

        <span className="text-label-sm bg-surface-container-high px-3 py-1 rounded-full text-on-surface font-semibold">
          Lagos, Nigeria 🇳🇬
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-on-surface text-headline-sm">Kiosq Africa</span>
          <span>• Chat Commerce &amp; Escrow</span>
        </div>
        <p className="text-xs">
          Licensed payment aggregation powered by CBN-approved financial partners. © 2025 Kiosq Inc.
        </p>
      </div>
    </footer>
  );
}
