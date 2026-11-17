export default function EscrowTrustSeal() {
  return (
    <section
      id="escrow"
      className="bg-surface-container-lowest rounded-DEFAULT p-6 sm:p-8 flex flex-col items-center text-center gap-4 shadow-sm border border-outline-variant/30 relative overflow-hidden"
    >
      {/* Decorative subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-label-md font-bold">
        <span className="material-symbols-outlined text-[18px]">lock</span>
        <span>Dual-Protection Escrow Guarantee</span>
      </div>

      <h3 className="text-headline-md sm:text-[26px] sm:leading-[32px] text-on-surface max-w-lg font-extrabold">
        No stories. 100% protected payments for seller &amp; buyer.
      </h3>

      <p className="text-body-md sm:text-[16px] sm:leading-[24px] text-on-surface-variant max-w-xl">
        Your money is held in escrow until you confirm delivery with a 4-digit PIN handoff,
        followed by an automatic 24-hour buyer inspection window.
      </p>

      {/* 3 Trust Badges Responsive Row */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-on-surface-variant">
        <span className="text-label-sm sm:text-label-md flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            verified_user
          </span>
          CBN Regulated Rails
        </span>
        <span className="text-label-sm sm:text-label-md flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            security
          </span>
          Zero Chargebacks
        </span>
        <span className="text-label-sm sm:text-label-md flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            pin
          </span>
          10-Sec PIN Release
        </span>
      </div>
    </section>
  );
}
