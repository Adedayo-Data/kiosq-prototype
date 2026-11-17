import StepCard from "./StepCard";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Snap & List",
      text: "Upload your item photo. Kiosq AI automatically drafts the title, description, and suggests fair market pricing.",
    },
    {
      id: 2,
      title: "Post Link",
      text: "Share the interactive link directly to your WhatsApp Status, broadcast lists, or Instagram DM with 1 tap.",
    },
    {
      id: 3,
      title: "AI Bids & Closes",
      text: "Smart haggling answers inquiries in plain Nigerian English or Pidgin, locking deals within your specified floor price.",
    },
    {
      id: 4,
      title: "Instant Payout",
      text: "Delivery is verified via delivery person PIN, and ₦ is wired directly to your Nigerian bank account within 3 minutes.",
    },
  ];

  return (
    <section id="how-it-works" className="flex flex-col gap-5">
      <div className="flex flex-col">
        <span className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
          Simple 4-Step Flow
        </span>
        <h2 className="text-headline-lg sm:text-[28px] text-on-surface font-extrabold">
          How Kiosq works
        </h2>
      </div>

      {/* Responsive 2x2 grid on desktop, 1-col on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <StepCard key={step.id} number={step.id} title={step.title} text={step.text} />
        ))}
      </div>
    </section>
  );
}
