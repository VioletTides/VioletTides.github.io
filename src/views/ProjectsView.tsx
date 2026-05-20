import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';

import { PROJECTS_PAGE_COPY } from '../constants/siteCopy';
import { loadListedProjects } from '../data/projects';
import { fadeItemVariants, fadeVariants } from '../motion/variants';
import { motionVariants } from '../motion/useMotionConfig';
import { StatusBadge } from '../components/StatusBadge';
import type { Project } from '../types';

export function ProjectsView({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const containerVariants = motionVariants(reducedMotion, fadeVariants);
  const itemVariants = motionVariants(reducedMotion, fadeItemVariants);

  useEffect(() => {
    let active = true;

    loadListedProjects()
      .then((loadedProjects) => {
        if (!active) {
          return;
        }
        setProjects(loadedProjects);
        setStatus('ready');
      })
      .catch((error) => {
        console.error('Failed to load projects', error);
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      className="flex-1 flex flex-col gap-6 min-h-0"
    >
      <motion.div
        variants={itemVariants}
        className="bg-amber-primary/10 border border-amber-primary/30 p-4 amber-text-glow"
      >
        <h2 className="text-xl font-sans font-bold text-amber-primary tracking-tight uppercase">
          PROJECTS_LIBRARY::INIT
        </h2>
        <p className="text-[11px] text-amber-primary/60 mt-1 uppercase tracking-widest">
          {status === 'ready'
            ? projects.length > 0
              ? PROJECTS_PAGE_COPY.count(projects.length)
              : PROJECTS_PAGE_COPY.empty
            : status === 'error'
              ? PROJECTS_PAGE_COPY.error
              : PROJECTS_PAGE_COPY.loading}
        </p>
      </motion.div>

      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center border border-white/10 bg-black/30">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-amber-primary/70">
            <LoaderCircle size={14} className="animate-spin" />
            Loading Projects
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex items-center justify-center border border-vfd-red/20 bg-black/30 p-6 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-vfd-red red-text-glow">
              Archive Offline
            </p>
            <p className="mt-3 text-sm text-white/60 font-mono">{PROJECTS_PAGE_COPY.error}</p>
          </div>
        </div>
      )}

      {status === 'ready' && projects.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex-1 flex flex-col items-center justify-center border border-amber-primary/20 bg-black/30 p-8 text-center gap-5"
        >
          <motion.div variants={itemVariants}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-primary/80 amber-text-glow">
              {PROJECTS_PAGE_COPY.empty}
            </p>
            <p className="mt-3 text-sm text-white/60 font-mono max-w-md leading-relaxed">
              {PROJECTS_PAGE_COPY.emptyDetail}
            </p>
          </motion.div>
        </motion.div>
      )}

      {status === 'ready' && projects.length > 0 && (
        <motion.div variants={itemVariants} className="md:flex-1 grid grid-cols-1 gap-4 md:overflow-y-auto md:pr-2 scrollbar-hide">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.slug}`}
              className="bg-black/40 border border-white/10 group hover:border-amber-primary/50 transition-all flex flex-col sm:flex-row relative overflow-hidden h-auto sm:h-48 text-left focus-visible:border-amber-primary/60"
            >
              <div className="absolute inset-0 crt-bg-effect opacity-5 pointer-events-none" />

              <div className="w-full sm:w-64 h-32 sm:h-full shrink-0 border-b sm:border-b-0 sm:border-r border-white/10 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img
                  src={p.thumbnail}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700 opacity-30 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-80" />
              </div>

              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <span className="text-[11px] font-mono text-white/30">REF_{p.id}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} pulse />
                      <ChevronRight
                        size={16}
                        className="text-white/25 group-hover:text-amber-primary transition-colors"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-sans font-bold text-amber-primary mb-1 amber-text-glow">
                    {p.title}
                  </h3>
                  <p className="text-sm text-white/70 mb-3 leading-relaxed font-mono line-clamp-2 md:line-clamp-3">
                    {p.desc}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-mono bg-white/5 border border-white/10 px-2 py-1 text-white/40 uppercase tracking-wider group-hover:text-amber-primary/80 group-hover:border-amber-primary/30 transition-colors"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
