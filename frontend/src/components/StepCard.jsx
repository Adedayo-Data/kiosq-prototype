export default function StepCard({ number, title, text }) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-DEFAULT flex items-start gap-4 shadow-xs border border-outline-variant/30 hover:border-primary/40 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-headline-sm font-bold shrink-0 shadow-xs">
        {number}
      </div>
      <div className="flex flex-col">
        <h3 className="text-headline-sm text-on-surface font-bold">{title}</h3>
        <p className="text-body-md text-on-surface-variant mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
