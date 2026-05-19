import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

import { fadeItemVariants, fadeVariants } from '../motion/variants';
import { motionVariants } from '../motion/useMotionConfig';
import { StatusBadge } from '../components/StatusBadge';
import { Panel } from '../components/Panel';
import type { Project } from '../types';

export function ProjectDetailView({
  project,
  reducedMotion = false,
}: {
  project: Project;
  reducedMotion?: boolean;
}) {
  const containerVariants = motionVariants(reducedMotion, fadeVariants);
  const itemVariants = motionVariants(reducedMotion, fadeItemVariants);

  return (
    <motion.div
      variants={containerVariants}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      className="flex-1 flex flex-col gap-6 min-h-0"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-amber-primary/10 border border-amber-primary/30 p-4"
      >
        <div className="space-y-1">
          <span className="text-[11px] text-amber-primary/50 uppercase tracking-[0.25em] font-bold">
            PROJECT_DETAIL::OPEN
          </span>
          <h2 className="text-xl font-sans font-bold text-amber-primary tracking-tight uppercase">
            {project.title}
          </h2>
          <p className="text-[11px] text-amber-primary/60 uppercase tracking-widest">
            REF_{project.id} / {project.period} / {project.role}
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center justify-center gap-2 border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase text-white/70 transition-colors hover:border-amber-primary/40 hover:text-amber-primary"
        >
          <ArrowLeft size={14} />
          Back To Index
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 min-h-0">
        <motion.div variants={itemVariants} className="flex flex-col gap-6 min-h-0">
          <div className="bg-black/40 border border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 crt-bg-effect opacity-10 pointer-events-none" />
            <div className="relative h-52 sm:h-72">
              <img
                src={project.thumbnail}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-[11px] text-white/30 uppercase tracking-[0.3em]">Overview</div>
                  <div className="text-lg sm:text-xl font-sans font-bold text-amber-primary amber-text-glow">
                    {project.title}
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.metrics.map((metric) => (
              <Panel key={metric.label} title={metric.label} bodyClassName="p-4">
                <div className="text-sm font-bold text-amber-primary amber-text-glow uppercase">
                  {metric.value}
                </div>
              </Panel>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Mission Brief" bodyClassName="p-4">
              <p className="text-sm text-white/70 leading-relaxed font-mono">{project.overview}</p>
            </Panel>
            <Panel title="System Outcome" bodyClassName="p-4">
              <p className="text-sm text-white/70 leading-relaxed font-mono">{project.outcome}</p>
            </Panel>
          </div>

          <Panel title="Primary Constraint" bodyClassName="p-4">
            <p className="text-sm text-white/70 leading-relaxed font-mono">{project.challenge}</p>
          </Panel>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <Panel title="Capability Stack" bodyClassName="p-4">
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="text-[11px] font-mono bg-white/5 border border-white/10 px-2 py-1 text-white/50 uppercase tracking-wider"
                >
                  {item}
                </span>
              ))}
            </div>
          </Panel>

          <Panel title="Highlights" bodyClassName="p-4">
            <div className="space-y-2">
              {project.highlights.map((highlight, index) => (
                <div key={highlight} className="flex gap-3 text-sm text-white/70 font-mono leading-relaxed">
                  <span className="text-white/20">{String(index + 1).padStart(2, '0')}</span>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Links" bodyClassName="p-4">
            <div className="space-y-2">
              {project.links.map((link) => {
                const isExternal = link.href.startsWith('http');
                const isPlaceholder = link.href === '#';

                if (isPlaceholder) {
                  return (
                    <span
                      key={link.label}
                      className="flex items-center justify-between border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase text-white/30"
                    >
                      {link.label}
                      <span className="text-[9px]">PENDING</span>
                    </span>
                  );
                }

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-between border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase text-white/60 transition-colors hover:border-amber-primary/30 hover:text-amber-primary"
                  >
                    <span>{link.label}</span>
                    <ExternalLink size={12} />
                  </a>
                );
              })}
            </div>
          </Panel>
        </motion.div>
      </div>
    </motion.div>
  );
}
