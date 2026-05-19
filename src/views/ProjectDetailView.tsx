import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

import { Project } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function ProjectDetailView({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col gap-6 min-h-0"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-amber-primary/10 border border-amber-primary/30 p-4">
        <div className="space-y-1">
          <span className="text-[11px] text-amber-primary/50 uppercase tracking-[0.25em] font-bold">PROJECT_DETAIL::OPEN</span>
          <h2 className="text-xl font-sans font-bold text-amber-primary tracking-tight uppercase">{project.title}</h2>
          <p className="text-[11px] text-amber-primary/60 uppercase tracking-widest">REF_{project.id} / {project.period} / {project.role}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase text-white/70 transition-colors hover:border-amber-primary/40 hover:text-amber-primary"
        >
          <ArrowLeft size={14} />
          Back To Index
        </button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 min-h-0">
        <motion.div variants={itemVariants} className="flex flex-col gap-6 min-h-0">
          <div className="bg-black/40 border border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 crt-bg-effect opacity-10 pointer-events-none" />
            <div className="relative h-52 sm:h-72">
              <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-[11px] text-white/30 uppercase tracking-[0.3em]">Overview</div>
                  <div className="text-lg sm:text-xl font-sans font-bold text-amber-primary amber-text-glow">{project.title}</div>
                </div>
                <span className={`text-[11px] font-mono border px-2 py-1 uppercase ${
                  project.status === 'STABLE'
                    ? 'border-vfd-green/40 bg-vfd-green/10 text-vfd-green green-text-glow'
                    : project.status === 'ACTIVE'
                      ? 'border-amber-primary/40 bg-amber-primary/10 text-amber-primary amber-text-glow'
                      : 'border-vfd-teal/40 bg-vfd-teal/10 text-vfd-teal vfd-text-glow'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.metrics.map((metric) => (
              <div key={metric.label} className="bg-black/40 border border-white/10 p-4">
                <div className="text-[11px] text-white/30 uppercase tracking-[0.22em]">{metric.label}</div>
                <div className="mt-2 text-sm font-bold text-amber-primary amber-text-glow uppercase">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/10 p-4">
              <div className="text-[11px] text-amber-primary uppercase tracking-[0.25em] font-bold mb-3">Mission Brief</div>
              <p className="text-sm text-white/70 leading-relaxed font-mono">{project.overview}</p>
            </div>
            <div className="bg-black/40 border border-white/10 p-4">
              <div className="text-[11px] text-amber-primary uppercase tracking-[0.25em] font-bold mb-3">System Outcome</div>
              <p className="text-sm text-white/70 leading-relaxed font-mono">{project.outcome}</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-4">
            <div className="text-[11px] text-amber-primary uppercase tracking-[0.25em] font-bold mb-3">Primary Constraint</div>
            <p className="text-sm text-white/70 leading-relaxed font-mono">{project.challenge}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="bg-black/40 border border-white/10 p-4">
            <div className="text-[11px] text-amber-primary uppercase tracking-[0.25em] font-bold mb-3">Capability Stack</div>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span key={item} className="text-[11px] font-mono bg-white/5 border border-white/10 px-2 py-1 text-white/50 uppercase tracking-wider">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-4">
            <div className="text-[11px] text-amber-primary uppercase tracking-[0.25em] font-bold mb-3">Highlights</div>
            <div className="space-y-2">
              {project.highlights.map((highlight, index) => (
                <div key={highlight} className="flex gap-3 text-sm text-white/70 font-mono leading-relaxed">
                  <span className="text-white/20">{String(index + 1).padStart(2, '0')}</span>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 p-4">
            <div className="text-[11px] text-amber-primary uppercase tracking-[0.25em] font-bold mb-3">Links</div>
            <div className="space-y-2">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase text-white/60 transition-colors hover:border-amber-primary/30 hover:text-amber-primary"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
