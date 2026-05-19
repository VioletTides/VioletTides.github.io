import React, { useEffect, useState } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';

import { loadProjects } from '../data/projects';
import { Project } from '../types';
import { ProjectDetailView } from './ProjectDetailView';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.3 }
  }
};

export const ProjectsView = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;

    loadProjects()
      .then((loadedProjects) => {
        if (!active) {
          return;
        }

        setProjects(loadedProjects);
        setStatus('ready');
      })
      .catch((error) => {
        console.error('Failed to load projects', error);
        if (!active) {
          return;
        }

        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedProject = projects.find((project) => project.slug === selectedSlug) ?? null;

  if (selectedProject) {
    return <ProjectDetailView project={selectedProject} onBack={() => setSelectedSlug(null)} />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col gap-6 min-h-0"
    >
      <motion.div variants={itemVariants} className="bg-amber-primary/10 border border-amber-primary/30 p-4 amber-text-glow">
        <h2 className="text-xl font-sans font-bold text-amber-primary tracking-tight uppercase">PROJECTS_LIBRARY::INIT</h2>
        <p className="text-[10px] text-amber-primary/60 mt-1 uppercase tracking-widest">
          {status === 'ready'
            ? `Scanning internal data stores... ${projects.length} matches found.`
            : status === 'error'
              ? 'Project index unavailable. Check local content manifest.'
              : 'Scanning internal data stores...'}
        </p>
      </motion.div>

      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center border border-white/10 bg-black/30">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-amber-primary/70">
            <LoaderCircle size={14} className="animate-spin" />
            Loading Project Manifest
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex items-center justify-center border border-vfd-red/20 bg-black/30 p-6 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-vfd-red red-text-glow">Manifest Error</div>
            <p className="mt-3 text-[11px] text-white/60 font-mono">Unable to load `public/content/projects.json`.</p>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="md:flex-1 grid grid-cols-1 gap-4 md:overflow-y-auto md:pr-2 scrollbar-hide">
          {projects.map((p) => (
            <motion.button
              type="button"
              key={p.id}
              onClick={() => setSelectedSlug(p.slug)}
              className="bg-black/40 border border-white/10 group hover:border-amber-primary/50 transition-all flex flex-col sm:flex-row relative overflow-hidden h-auto sm:h-48 text-left"
            >
              <div className="absolute inset-0 crt-bg-effect opacity-5 pointer-events-none" />
              
              <div className="w-full sm:w-64 h-32 sm:h-full shrink-0 border-b sm:border-b-0 sm:border-r border-white/10 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                 <img 
                   src={p.thumbnail} 
                   alt={p.title} 
                   className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700 opacity-30 group-hover:opacity-80" 
                 />
                 <div className="absolute inset-0 bg-black/20" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-80" />
              </div>

              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <span className="text-[10px] font-mono text-white/20">REF_{p.id}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono border px-2 py-0.5 animate-pulse-live uppercase ${
                        p.status === 'STABLE' 
                          ? 'border-vfd-green/40 bg-vfd-green/10 text-vfd-green green-text-glow' 
                          : p.status === 'ACTIVE'
                            ? 'border-amber-primary/40 bg-amber-primary/10 text-amber-primary amber-text-glow'
                            : 'border-vfd-teal/40 bg-vfd-teal/10 text-vfd-teal vfd-text-glow'
                      }`}>
                        {p.status}
                      </span>
                      <ChevronRight size={16} className="text-white/25 group-hover:text-amber-primary transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-lg font-sans font-bold text-amber-primary mb-1 amber-text-glow">{p.title}</h3>
                  <p className="text-[11px] text-white/70 mb-3 leading-relaxed font-mono line-clamp-2 md:line-clamp-3">{p.desc}</p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {p.stack.map((s) => (
                    <span key={s} className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-1 text-white/40 uppercase tracking-wider group-hover:text-amber-primary/80 group-hover:border-amber-primary/30 transition-colors">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
