import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

import { loadProjectBySlug } from '../data/projects';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { ProjectDetailView } from '../views/ProjectDetailView';
import type { Project } from '../types';

export function ProjectDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  const { reducedMotion } = useAppOutlet();
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not_found'>('loading');

  useEffect(() => {
    if (!slug) {
      setStatus('not_found');
      return;
    }

    let active = true;
    setStatus('loading');

    loadProjectBySlug(slug)
      .then((loaded) => {
        if (!active) {
          return;
        }
        if (!loaded) {
          setStatus('not_found');
          return;
        }
        setProject(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (active) {
          setStatus('not_found');
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center border border-white/10 bg-black/30">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-amber-primary/70">
          <LoaderCircle size={14} className="animate-spin" />
          Loading Project
        </div>
      </div>
    );
  }

  if (status === 'not_found' || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border border-vfd-red/20 bg-black/30 p-6 text-center gap-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-vfd-red red-text-glow">
          Project Not Found
        </p>
        <Link
          to="/projects"
          className="text-[11px] font-bold uppercase text-amber-primary border border-amber-primary/30 px-4 py-2 hover:bg-amber-primary/10"
        >
          Back To Index
        </Link>
      </div>
    );
  }

  return <ProjectDetailView project={project} reducedMotion={reducedMotion} />;
}
