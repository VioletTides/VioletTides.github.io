import { OPERATOR_LOCATION, OPERATOR_NAME, OPERATOR_TITLE } from '../../constants/operator';
import { useOperatorClock } from '../../hooks/useOperatorClock';
import { Panel } from '../Panel';

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 pb-1.5 last:border-b-0">
      <span className="text-[11px] text-amber-primary/50 amber-text-glow uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[12px] text-white/85 leading-snug">{value}</span>
    </div>
  );
}

export function OperatorBriefPanel() {
  const localTime = useOperatorClock();

  return (
    <Panel title="OPERATOR_BRIEF" right="SYS-01" className="h-full min-h-0" bodyClassName="p-3 flex flex-col gap-2">
      <BriefRow label="OPERATOR" value={OPERATOR_NAME} />
      <BriefRow label="ROLE" value={OPERATOR_TITLE} />
      <BriefRow label="LOCATION" value={OPERATOR_LOCATION} />
      <BriefRow label="LOCAL_TIME" value={localTime} />
    </Panel>
  );
}
