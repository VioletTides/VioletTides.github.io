export const ModuleHeader = ({ title, right }: { title: string; right?: string }) => (
  <div className="bg-[#151000] px-3 py-1.5 border-b border-amber-primary/10 flex justify-between items-center relative z-10">
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className="status-led status-led-sm" aria-hidden />
        <span className="text-[11px] font-bold text-amber-primary amber-text-glow tracking-[0.2em]">{title}</span>
      </div>
    </div>
    {right && (
      <div className="flex items-center gap-3">
        <div className="h-2 w-px bg-white/5" />
        <span className="text-[10px] text-vfd-teal/60 uppercase tracking-tighter font-medium">{right}</span>
      </div>
    )}
    <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
  </div>
);
