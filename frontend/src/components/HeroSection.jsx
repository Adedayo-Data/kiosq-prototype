import { Link } from "react-router";
import KiosqLogo from "./KiosqLogo";

export default function HeroSection() {
  return (
    <section className="flex flex-col gap-6 md:gap-8 relative pt-2">
      {/* Brand Header: Crisp Vector Kiosq Logo */}
      <div className="flex justify-between items-center">
        <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
          <KiosqLogo className="h-10 sm:h-12 md:h-13 w-auto" />
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-label-sm text-on-surface-variant font-semibold">
            Social-Commerce &amp; Escrow
          </span>
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <svg
              className="text-primary"
              fill="none"
              height="20"
              viewBox="0 0 32 24"
              width="26"
              aria-hidden="true"
            >
              <path
                d="M2 12C2 6.47715 6.47715 2 12 2H20C25.5228 2 30 6.47715 30 12C30 17.5228 25.5228 22 20 22H9L3 23L4.5 18C2.9 16.3 2 14.2 2 12Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M10 11H10.01M16 11H16.01M22 11H22.01"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Copy on Left, Interactive Simulation on Right (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* Left Column: Headlines & CTA */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col">
            <h1 className="text-display-lg sm:text-[44px] sm:leading-[50px] lg:text-[52px] lg:leading-[58px] text-on-surface tracking-tight font-extrabold">
              Your{" "}
              <span className="bg-primary text-on-primary px-3 py-1 inline-block -rotate-1 rounded-sm mx-1 shadow-sm">
                shop
              </span>
              <br className="hidden sm:inline" />
              in the chat.
            </h1>
            <p className="text-body-lg sm:text-[18px] sm:leading-[26px] text-on-surface-variant mt-3 max-w-xl">
              Sell on WhatsApp with safe payments, dual-protection escrow, and an AI agent that
              negotiates and closes deals for you 24/7.
            </p>
          </div>

          {/* CTA & Curled Doodle Arrow */}
          <div className="flex flex-col gap-2 pt-1 relative max-w-md">
            <div className="relative flex items-center">
              <Link
                to="/signup"
                className="w-full sm:w-auto sm:px-8 bg-primary text-on-primary text-headline-sm py-4 px-6 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
              >
                <span>Open your Kiosq</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>

            {/* Curled Hand-Drawn Ink Arrow Label */}
            <div className="flex items-center gap-2 pl-3 pt-1">
              <svg
                className="text-primary shrink-0"
                fill="none"
                height="22"
                viewBox="0 0 40 24"
                width="36"
                aria-hidden="true"
              >
                <path
                  d="M4 18C12 20 28 22 34 6M34 6L28 6M34 6L35 12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-label-sm text-on-surface-variant italic">
                Takes less than 60 seconds • Zero upfront fees
              </span>
            </div>
          </div>

          {/* Social Proof Strip */}
          <div className="bg-surface-container-high rounded-full px-4 py-2.5 flex items-center gap-2 mt-1 w-fit">
            <span className="text-label-md text-on-surface flex items-center gap-1.5">
              <span className="text-primary">⚡</span>
              <span>Over 4,200 Nigerian sellers thriving on WhatsApp</span>
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Chat & Escrow Preview */}
        <div className="lg:col-span-5 w-full">
          <div className="w-full bg-surface-container-lowest rounded-DEFAULT p-5 flex flex-col gap-3 shadow-md border border-outline-variant/30 relative">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-md font-bold shadow-xs">
                  AI
                </div>
                <div>
                  <p className="text-label-md text-on-surface leading-tight font-bold">
                    Kiosq Haggler Bot
                  </p>
                  <p className="text-body-sm text-on-surface-variant">Active in dm_uche_lagos</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-label-sm text-on-surface font-semibold">
                Live Now
              </span>
            </div>

            {/* Chat Bubble Simulation */}
            <div className="bg-surface-container p-3.5 rounded-DEFAULT flex flex-col gap-2.5 border border-surface-container-high">
              <p className="text-body-md text-on-surface leading-relaxed">
                “Buyer offered ₦22,000 for Vintage Adire Shirt. Floor is ₦25,000. Counter-offered{" "}
                <span className="font-bold">₦26,500</span> with free delivery within Yaba!”
              </p>
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-surface-container-high/60">
                <span className="text-label-sm text-secondary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">lock</span>
                  ₦26,500 Ready for Escrow
                </span>
                <span className="text-label-sm text-on-surface-variant font-medium">
                  Status: Auto-Negotiating
                </span>
              </div>
            </div>

            {/* Quick Micro Guarantee inside the Mockup */}
            <div className="flex items-center justify-between text-label-sm text-on-surface-variant pt-1 px-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  verified
                </span>
                4-Digit PIN Handoff
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  timer
                </span>
                24h Inspection Window
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
