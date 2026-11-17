export default function KiosqLogo({ className = "h-14 w-auto", alt = "Kiosq — Chat Commerce" }) {
  return (
    <img
      src="/kiosq-logo.png"
      alt={alt}
      className={`${className} object-contain select-none`}
    />
  );
}
