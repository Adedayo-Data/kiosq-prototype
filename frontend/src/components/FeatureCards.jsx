export default function FeatureCards() {
  return (
    <section id="features" className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
            Features Built For Informal Commerce
          </span>
          <h2 className="text-headline-lg sm:text-[28px] text-on-surface font-extrabold">
            Built for pure hustle
          </h2>
        </div>
        <span className="text-label-sm px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-semibold">
          0% Setup Fee
        </span>
      </div>

      {/* 3-Column Responsive Grid on Tablet / Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Share your link */}
        <div className="bg-surface-container-lowest p-5 rounded-DEFAULT flex flex-col justify-between gap-4 relative overflow-hidden shadow-xs border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <svg
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span className="text-label-sm bg-surface-container-high px-2.5 py-0.5 rounded-full text-on-surface font-semibold">
              Status Ready
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-headline-sm text-on-surface font-bold">Share your link</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Post straight to your WhatsApp Status with auto-generated, branded product cards that
              customers tap to buy directly.
            </p>
          </div>

          <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between">
            <button
              className="text-left text-label-md text-on-surface underline underline-offset-4 flex items-center gap-1 cursor-pointer font-bold"
              type="button"
            >
              See sample catalog
              <span className="material-symbols-outlined text-[16px]">north_east</span>
            </button>
          </div>
        </div>

        {/* Card 2: Let AI haggle */}
        <div className="bg-surface-container-lowest p-5 rounded-DEFAULT flex flex-col justify-between gap-4 relative overflow-hidden shadow-xs border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <svg
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                aria-hidden="true"
              >
                <rect height="12" rx="2" width="16" x="4" y="6" />
                <path d="M9 11v.01M15 11v.01" />
                <path d="M9 15h6" />
                <path d="M12 2v4M2 12h2M20 12h2" />
              </svg>
            </div>
            <span className="text-label-sm bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-bold">
              24/7 Closes Deals
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-headline-sm text-on-surface font-bold">Let AI haggle</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Kiosq AI negotiates fair deals in Pidgin or plain English 24/7 without waking you up.
              It strictly protects your minimum profit floor.
            </p>
          </div>

          <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between">
            <button
              className="text-left text-label-md text-on-surface underline underline-offset-4 flex items-center gap-1 cursor-pointer font-bold"
              type="button"
            >
              Test haggler live
              <span className="material-symbols-outlined text-[16px]">chat</span>
            </button>
          </div>
        </div>

        {/* Card 3: Get paid safely */}
        <div className="bg-surface-container-lowest p-5 rounded-DEFAULT flex flex-col justify-between gap-4 relative overflow-hidden shadow-xs border border-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <svg
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                aria-hidden="true"
              >
                <rect height="11" rx="2" width="18" x="3" y="11" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-label-sm bg-surface-container-high px-2.5 py-0.5 rounded-full text-on-surface font-semibold">
              Instant ₦ Payout
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-headline-sm text-on-surface font-bold">Get paid safely</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Buyer funds stay locked in dual-protection escrow with 10-second PIN handoff and 24-hr
              auto-release. Say goodbye to fake alert scams.
            </p>
          </div>

          <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between">
            <button
              className="text-left text-label-md text-on-surface underline underline-offset-4 flex items-center gap-1 cursor-pointer font-bold"
              type="button"
            >
              How escrow protects you
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
