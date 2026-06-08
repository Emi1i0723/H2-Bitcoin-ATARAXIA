import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Shield,
  Code,
  KeyRound,
  Key,
  Milestone,
  Fingerprint,
  FileCode,
  Lock,
  CalendarDays,
  Timer,
  ShieldAlert,
  Wallet,
  X,
  BookOpen
} from 'lucide-react';
import { GlossaryItem } from '../types';

interface GlossaryModalProps {
  item: GlossaryItem | null;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Shield,
  Code,
  KeyRound,
  Key,
  Milestone,
  Fingerprint,
  FileCode,
  Lock,
  CalendarDays,
  Timer,
  ShieldAlert,
  Wallet
};

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const IconComponent = iconMap[item.iconName] || BookOpen;

  const categoryLabels: Record<string, string> = {
    ataraxia: 'Ataraxia Core',
    seguridad: 'Seguridad y Custodia',
    avanzado: 'Concepto Técnico',
    wallet: 'Básico de Billetera'
  };

  const categoryColors: Record<string, string> = {
    ataraxia: 'bg-red-50 border-red-200 text-[#E60023]',
    seguridad: 'bg-green-50 border-green-200 text-green-750',
    avanzado: 'bg-blue-50 border-blue-200 text-[#2F9CF5]',
    wallet: 'bg-purple-50 border-purple-200 text-[#B7A6FF]'
  };

  return (
    <AnimatePresence>
      <div 
        id="glossary-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          id="glossary-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg overflow-hidden border rounded-3xl bg-white border-neutral-200 shadow-2xl text-neutral-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header background glow */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#B7A6FF]/10 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            id="close-glossary-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
            title="Cerrar"
          >
            <X size={18} />
          </button>

          <div className="p-6 md:p-8">
            {/* Icon & Category */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-neutral-50 rounded-xl text-[#B7A6FF] border border-neutral-200">
                <IconComponent size={24} className="stroke-[1.5]" />
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${categoryColors[item.category] || 'bg-neutral-50 border-neutral-200'}`}>
                  {categoryLabels[item.category] || item.category}
                </span>
                <span className="block text-xs text-neutral-400 mt-0.5">Definición de Ataraxia</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold font-display text-neutral-900 mb-4 tracking-tight">
              {item.title}
            </h3>

            {/* Content description */}
            <div className="space-y-4 text-neutral-700 text-sm md:text-base leading-relaxed font-sans">
              <p className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/75 font-light">
                {item.definition}
              </p>
            </div>

            {/* Tips / Extra user friendliness */}
            <div className="mt-6 pt-6 border-t border-neutral-150 flex items-start gap-2.5 text-xs text-neutral-600 bg-red-50 p-4 rounded-xl border border-red-100">
              <Sparkles size={16} className="text-[#E60023] shrink-0 mt-0.5" />
              <p>
                <strong className="text-neutral-800">Tip de Autocustodia:</strong> Estudiar estos conceptos te ayuda a dominar la soberanía sobre tu propio dinero. ¡La soberanía es libertad!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
