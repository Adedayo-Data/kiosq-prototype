export default function ProofGallery() {
  const merchants = [
    {
      name: "Zara Ankara Vault",
      location: "Yaba, Lagos",
      deals: "180+ Deals",
      tag: "Fashion & Fabrics",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCBX-u9wryLR56yDqXiQu3bprUb7DT2qXKe4wlyxQqhfRjBtNDiLASybetYqLudyEyxtDK-sheSgmIE5mDbWioeoxc3OZTGL31pG32E6E4mEI1Cf2YTexWBVJLt2BizO_GB_-ZKYNCRHgTVDlfimMrfHnWbVrYMxjw05hgGX5fmk66NBuve_lFGVuQB3auf3tHAnijR7fYfehoj4gSFZnkGIr8yRgGm0XMX8NwDO1-n",
      alt: "Lagos fashion merchant styling vibrant Nigerian patterned fabrics",
    },
    {
      name: "Kicks by Emeka",
      location: "Wuse II, Abuja",
      deals: "340+ Deals",
      tag: "Footwear & Dropship",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDCmkOTf2Gi6WDBUDsF9jh5Bm8p1mpdjAWTrenu6lhZ2knb1RZga7L913-QANPu_Aox4kq-aa3rygZLLOvOdK48MImMt88CN3D-yC1IleipBYtXwlQXYnpWwU_RfpkZ-Xq7H98UQCRsDDdapHalEW4ppP5GV745cCobx5RsGWN-LNxGPBKqAb4Rn3eIuHpI0Z-yb4XeS-HkIc0S1898uDkibmN2nxznGb-CK-AZ6x8D",
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
