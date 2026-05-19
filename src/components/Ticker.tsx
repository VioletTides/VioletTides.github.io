import React from 'react';

export const Ticker = ({ title, mod, items }: { title: string; mod: string; items: string[] }) => (
  <div className="bg-surface-card border border-white/10 overflow-hidden relative group">
    <div className="absolute inset-0 crt-bg-effect opacity-10 pointer-events-none" />
    <div className="bg-black/80 px-3 py-1.5 flex justify-between items-center border-b border-amber-primary/20 relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-vfd-green rounded-full animate-pulse-live shadow-[0_0_8px_#00ff41]" />
        <span className="text-[10px] font-bold tracking-wider text-amber-primary/80 uppercase amber-text-glow">{title}</span>
      </div>
      <span className="text-[10px] text-vfd-teal/40 font-mono tracking-tighter">{mod}</span>
    </div>
    <div className="p-3 overflow-hidden whitespace-nowrap relative z-10 bg-[#0a0800]">
      {/* VFD Dot Grid Overlay */}
      <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none z-20" />
      
      <div className="flex gap-6 animate-ticker relative z-10">
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="text-[11px] text-amber-primary uppercase amber-text-glow font-mono tracking-widest">
            {item} <span className="text-vfd-teal/40 mx-2 font-bold opacity-30">|</span>
          </span>
        ))}
      </div>
    </div>
  </div>
);
