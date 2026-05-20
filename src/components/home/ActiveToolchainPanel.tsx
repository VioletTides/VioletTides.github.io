import { ACTIVE_TOOLCHAIN, type ToolchainCategory } from '../../constants/operator';
import { Panel } from '../Panel';

const CATEGORY_ORDER: ToolchainCategory[] = [
  'LANGUAGES',
  'DESIGN',
  'PLATFORMS',
  'PROTOCOLS',
  'DEV',
];

const CHIP_CLASS =
  'border border-amber-primary/25 bg-amber-primary/8 px-1.5 py-1 text-amber-primary/90 amber-text-glow uppercase tracking-wide text-[11px] leading-snug text-center whitespace-nowrap';

export function ActiveToolchainPanel({ className = '' }: { className?: string }) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: ACTIVE_TOOLCHAIN.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <Panel
      title="ACTIVE_TOOLCHAIN"
      right="TL-02"
      className={`h-full min-h-0 max-h-full overflow-hidden ${className}`}
      bodyClassName="p-2.5 min-h-0 flex-1 flex flex-col overflow-hidden"
    >
      <div className="grid grid-cols-5 gap-x-2.5 min-h-0 flex-1 h-full items-stretch">
        {grouped.map(({ category, items }) => (
          <div
            key={category}
            className="flex min-w-0 flex-col gap-1.5 overflow-hidden"
          >
            <span className="shrink-0 border-b border-vfd-teal/20 pb-1 text-center text-[9px] text-vfd-teal/70 vfd-text-glow uppercase tracking-wider leading-tight">
              {category}
            </span>
            <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
              {items.map((item) => (
                <li
                  key={item.name}
                  className={CHIP_CLASS}
                  title={item.name === 'Scopes / LA' ? 'Scopes & logic analyzers' : undefined}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
