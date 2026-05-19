import { Download, Github, Linkedin } from 'lucide-react';

import { CONTACT_EMAIL, resumeUrl } from '../constants/contact';
import { IMAGES } from '../constants/images';

export function MobileProfileHeader({ reducedMotion }: { reducedMotion: boolean }) {
  const resumeHref = resumeUrl();

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-card border border-white/10 p-1 amber-box-glow max-w-[240px] mx-auto w-full">
        <div className="bg-surface-dark border border-white/10 p-1 relative">
          <div className="aspect-square relative overflow-hidden bg-black border border-white/10">
            <img
              src={IMAGES.PROFILE}
              alt="Robin Anderson"
              width={720}
              height={720}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover brightness-110 contrast-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
              }}
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            {!reducedMotion && (
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-transparent via-amber-primary/30 to-transparent animate-[ticker_4s_linear_infinite]" />
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-amber-primary/50 px-2 py-1 max-w-[calc(100%-1.5rem)]">
              <span className="text-[9px] text-amber-primary amber-text-glow font-bold tracking-widest break-all">
                UID: R0B1N // 4ND3R50N
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-center">
        <h1 className="text-2xl text-amber-primary font-sans font-bold tracking-tight amber-text-glow uppercase leading-none">
          ROBIN ANDERSON
        </h1>
        <p
          className={`text-base text-white/90 amber-text-glow font-sans font-medium ${
            reducedMotion ? '' : 'blinking-cursor'
          }`}
        >
          Embedded Systems Engineer
        </p>
        <div className="flex flex-row flex-wrap items-center gap-2 pt-1 justify-center">
          <a
            href={resumeHref}
            download="Robin-Anderson-Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download resume PDF (${CONTACT_EMAIL})`}
            className="bg-amber-primary text-black font-bold text-[10px] px-4 py-2.5 uppercase hover:brightness-110 transition-all border border-amber-primary flex items-center gap-2 amber-box-glow justify-center active:scale-95"
          >
            <Download size={14} />
            DOWNLOAD_RESUME.PDF
          </a>
          <div className="flex gap-2 justify-center shrink-0">
            <a
              href="https://github.com/VioletTides"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Robin Anderson GitHub profile"
              className="w-10 h-10 flex items-center justify-center border border-white/10 text-white/60 hover:border-amber-primary hover:text-amber-primary transition-all hover:bg-amber-primary/5 active:scale-95"
            >
              <Github size={18} />
            </a>
            <a
              href="https://linkedin.com/in/robin34anderson"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Robin Anderson LinkedIn profile"
              className="w-10 h-10 flex items-center justify-center border border-white/10 text-white/60 hover:border-amber-primary hover:text-amber-primary transition-all hover:bg-amber-primary/5 active:scale-95"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
