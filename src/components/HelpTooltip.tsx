import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  termId: string;
  children?: React.ReactNode;
  onOpenTerm: (termId: string) => void;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  termId,
  children,
  onOpenTerm,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {children ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onOpenTerm(termId);
          }}
          className="cursor-help border-b border-dashed border-brand-purple/60 hover:border-brand-purple hover:text-white transition-colors"
          title="Ver definición en el glosario"
        >
          {children}
        </span>
      ) : null}
      <button
        type="button"
        id={`help-btn-${termId}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpenTerm(termId);
        }}
        className="text-brand-purple/70 hover:text-brand-purple p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-brand-purple/50 transition-colors"
        title="Explicar término"
      >
        <HelpCircle size={14} className="inline stroke-[2]" />
      </button>
    </span>
  );
};
