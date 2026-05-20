import { OPERATOR_FOCUS_LINES } from '../constants/operator';

export function OperatorFocusBrief() {
  return (
    <div className="text-center md:text-left px-0.5">
      {OPERATOR_FOCUS_LINES.map((line) => (
        <p key={line} className="text-sm text-white/85 font-sans leading-relaxed mb-3 last:mb-0">
          {line}
        </p>
      ))}
    </div>
  );
}
