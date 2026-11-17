import { FALLBACK_ANKARA_IMAGE, FALLBACK_SNEAKERS_IMAGE } from "../utils/constants";

export default function ProofGallery() {
  const merchants = [
    {
      name: "Zara Ankara Vault",
      location: "Yaba, Lagos",
      deals: "180+ Deals",
      tag: "Fashion & Fabrics",
      image: FALLBACK_ANKARA_IMAGE,
      alt: "Lagos fashion merchant styling vibrant Nigerian patterned fabrics",
    },
    {
      name: "Kicks by Emeka",
      location: "Wuse II, Abuja",
      deals: "340+ Deals",
      tag: "Footwear & Dropship",
      image: FALLBACK_SNEAKERS_IMAGE,
      alt: "Young Nigerian footwear vendor arranging handcrafted leather sneakers",
    },
  ];

  return (
    <section id="merchants" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
            Real Social Sellers
          </span>
          <h2 className="text-headline-md sm:text-[24px] text-on-surface font-extrabold">
            From Balogun to Abuja
          </h2>
        </div>
        <span className="text-label-sm text-on-surface-variant font-medium bg-surface-container-high px-3 py-1 rounded-full">
          Active Kiosqs
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {merchants.map((merchant) => (
          <div
            key={merchant.name}
            className="flex flex-col bg-surface-container-lowest rounded-DEFAULT overflow-hidden shadow-xs border border-outline-variant/30 hover:shadow-md transition-all"
          >
            <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-surface-container">
              <img
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                src={merchant.image}
                alt={merchant.alt}
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-primary/80 backdrop-blur-xs text-on-primary text-label-sm px-2.5 py-1 rounded-full">
                {merchant.tag}
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-headline-sm text-on-surface truncate font-bold">
                  {merchant.name}
                </span>
                <span className="text-body-sm text-on-surface-variant mt-0.5">
                  {merchant.location}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-label-sm font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {merchant.deals}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
