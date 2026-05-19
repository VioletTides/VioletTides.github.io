import type { ReactNode } from 'react';
import { ModuleHeader } from './ModuleHeader';

export function Panel({
  title,
  right,
  children,
  className = '',
  bodyClassName = 'p-3',
}: {
  title: string;
  right?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`bg-black/40 border border-white/10 flex flex-col relative ${className}`}>
      <div className="absolute inset-0 crt-bg-effect opacity-20 pointer-events-none" />
      <ModuleHeader title={title} right={right} />
      <div className={`${bodyClassName} z-10`}>{children}</div>
    </div>
  );
}
