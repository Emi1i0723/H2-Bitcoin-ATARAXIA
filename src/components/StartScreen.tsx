import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  PlusCircle,
  FolderOpen,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface StartScreenProps {
  onCreateWallet: () => void;
  onOpenDemo: () => void;
  onImportMock: () => void;
  onExploreGlossary: () => void;
  onOpenTerm: (termId: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onCreateWallet,
  onOpenDemo,
  onImportMock,
  onExploreGlossary,
  onOpenTerm,
}) => {
  return (
    <div id="start-screen" className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#F5F5F5] selection:bg-brand-red/20">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-[450px] h-72 md:h-[450px] rounded-full bg-brand-red/10 blur-[90px] pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 right-10 w-60 h-60 rounded-full bg-brand-purple/15 blur-[100px] pointer-events-none opacity-60" />

      {/* Main Container */}
      <motion.div
        id="start-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-white border border-gray-200 shadow-xl rounded-[32px] p-6 md:p-12 text-center relative overflow-hidden"
      >
        {/* Ataraxia Premium Abstract Logo Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            id="logo-brand-icon"
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 rounded-2xl bg-[#E60023] flex items-center justify-center shadow-lg relative cursor-pointer"
          >
            {/* Minimalist modern A design and delta */}
            <div className="absolute inset-2 border-2 border-white/20 rounded-xl" />
            <span className="font-display text-4xl font-black text-white italic tracking-tighter">A</span>
            <div className="absolute -bottom-1 -right-1 bg-brand-yellow text-brand-dark text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md border border-brand-dark">
              MVP
            </div>
          </motion.div>
        </div>

        {/* Brand Header */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display mb-2 text-[#E60023]">
          ATARAXIA
        </h1>
        <p className="text-[#B7A6FF] text-xs md:text-sm font-semibold tracking-wider uppercase mb-6 flex items-center justify-center gap-1.5">
          <ShieldCheck size={16} className="text-[#2F9CF5]" />
          La primera wallet de Bitcoin en español
        </p>

        {/* Subtitle / Pitch */}
        <p className="text-gray-600 text-sm md:text-base font-sans max-w-lg mx-auto mb-8 leading-relaxed">
          Diseñada para usuarios mexicanos interesados en emprender en el mundo de Bitcoin sin complicaciones técnicas. Aprende, gestiona y transacciona con completa seguridad y <HelpTooltip termId="autocustodia" onOpenTerm={onOpenTerm}>autocustodia</HelpTooltip>.
        </p>

        <div className="bg-[#2F9CF5]/10 border border-[#2F9CF5]/20 rounded-2xl p-4.5 mb-8 text-left max-w-md mx-auto flex items-start gap-3">
          <div className="p-2 bg-[#2F9CF5]/10 text-[#2F9CF5] rounded-xl mt-0.5 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
              ¡Bienvenido!
            </h4>
            <p className="text-xs text-gray-500 leading-normal mt-0.5">
              ¿Qué quieres hacer hoy? Explora las opciones para configurar tu billetera multinivel o repasar fundamentos.
            </p>
          </div>
        </div>

        {/* Buttons Grid */}
        <div id="start-actions-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
          {/* CREATE WALLET */}
          <motion.div
            id="btn-create-wallet"
            role="button"
            tabIndex={0}
            onClick={onCreateWallet}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCreateWallet();
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-start p-5 bg-[#E60023] rounded-2xl text-left shadow-lg text-white font-sans transition-all hover:bg-red-700 relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E60023]"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <PlusCircle size={20} className="stroke-[2.5]" />
              </div>
              <ArrowRight size={16} className="opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <span className="font-bold text-base md:text-lg block">Crear Wallet</span>
            <span className="text-[11px] text-white/90 font-light mt-1">
              Configura tu billetera Single o <HelpTooltip termId="timelocker" onOpenTerm={onOpenTerm} className="text-white underline">Multi Signature</HelpTooltip> con seguridad de vanguardia.
            </span>
          </motion.div>

          {/* OPEN WALLET DEMO */}
          <motion.div
            id="btn-open-demo"
            role="button"
            tabIndex={0}
            onClick={onOpenDemo}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenDemo();
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-start p-5 bg-white border border-gray-200 rounded-2xl text-left font-sans transition-all hover:bg-gray-50 hover:border-gray-300 text-neutral-800 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2F9CF5]"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-1.5 bg-[#2F9CF5]/10 text-[#2F9CF5] rounded-lg">
                <FolderOpen size={20} />
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
            </div>
            <span className="font-bold text-base md:text-lg block text-neutral-900">Abrir Wallet Demo</span>
            <span className="text-[11px] text-gray-500 font-light mt-1 leading-normal">
              Explora una billetera de pruebas con <strong className="text-gray-800">97,500 sats</strong> precargados y simula movimientos.
            </span>
          </motion.div>

          {/* IMPORT WALLET */}
          <motion.div
            id="btn-import-mock"
            role="button"
            tabIndex={0}
            onClick={onImportMock}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onImportMock();
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-start p-5 bg-white border border-gray-200 rounded-2xl text-left font-sans transition-all hover:bg-gray-50 hover:border-gray-300 text-neutral-800 shadow-sm md:col-span-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
                <Download size={20} />
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
            </div>
            <span className="font-bold text-base md:text-lg block text-neutral-900">Importar Wallet</span>
            <span className="text-[11px] text-gray-500 font-light mt-1 leading-normal">
              Trae tu billetera usando tus <HelpTooltip termId="llaves-privadas" onOpenTerm={onOpenTerm}>Llaves privadas</HelpTooltip> o frases semilla de forma guiada.
            </span>
          </motion.div>

          {/* FUNDAMENTOS */}
          <motion.div
            id="btn-explore-glossary"
            role="button"
            tabIndex={0}
            onClick={onExploreGlossary}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExploreGlossary();
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-start p-5 bg-purple-50/50 border border-[#B7A6FF]/30 rounded-2xl text-left font-sans transition-all hover:bg-purple-50 hover:border-[#B7A6FF]/40 text-[#B7A6FF] md:col-span-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B7A6FF]"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-1.5 bg-[#B7A6FF]/20 rounded-lg">
                <BookOpen size={20} />
              </div>
              <ArrowRight size={16} className="text-[#B7A6FF] group-hover:translate-x-1 transition-all" />
            </div>
            <span className="font-bold text-base md:text-lg block text-[#111111]">Repasar Fundamentos</span>
            <span className="text-[11px] text-gray-600 font-light mt-1 leading-normal">
              Glosario visual interactivo para resolver tus dudas y aprender sobre Bitcoin sin complicaciones.
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer Branding credits */}
      <div id="footer-credits" className="mt-8 text-center text-xs text-neutral-400 font-mono">
        ATARAXIA BITCOIN COOP © 2026 • Mérida, Yucatán • Hackathon MVP
      </div>
    </div>
  );
};
