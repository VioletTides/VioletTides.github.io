export function Ticker({
  title,
  mod,
  items,
  reducedMotion = false,
}: {
  title: string;
  mod: string;
  items: string[];
  reducedMotion?: boolean;
}) {
  return (
    <div className="bg-surface-card border border-white/10 overflow-hidden relative isolate group">
      <div className="absolute inset-0 crt-bg-effect opacity-10 pointer-events-none" />
      <div className="bg-black/80 px-3 py-1.5 flex justify-between items-center border-b border-amber-primary/20 relative z-10">
        <div className="flex items-center gap-2">
          <div className="status-led status-led-sm" aria-hidden />
          <span className="text-[11px] font-bold tracking-wider text-amber-primary/80 uppercase amber-text-glow">
            {title}
          </span>
        </div>
        <span className="text-[11px] text-vfd-teal/40 font-mono tracking-tighter">{mod}</span>
      </div>
      <div className="p-3 overflow-hidden whitespace-nowrap relative z-10 bg-[#0a0800]">
        <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none z-20" />
        <div className={`flex w-max gap-6 relative z-10 ${reducedMotion ? '' : 'animate-ticker'}`}>
          {[...items, ...items].map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="text-[13px] text-amber-primary uppercase amber-text-glow font-mono tracking-widest"
            >
              {item} <span className="text-vfd-teal/40 mx-2 font-bold opacity-30">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
