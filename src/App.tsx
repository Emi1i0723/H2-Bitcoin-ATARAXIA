import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  KeyRound,
  X,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { ViewType, PolicyType, Keystore, TimelockConfig, SidebarTab } from './types';
import { StartScreen } from './components/StartScreen';
import { SetupScreen } from './components/SetupScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { GlossaryModal } from './components/GlossaryModal';
import { glossaryData, defaultKeystores } from './data';

export default function App() {
  // Current visible view
  const [currentView, setCurrentView] = useState<ViewType>('inicio');

  // Active glossary modal term key
  const [activeTermId, setActiveTermId] = useState<string | null>(null);

  // Active dashboard tab to open initially
  const [dashboardInitialTab, setDashboardInitialTab] = useState<SidebarTab>('resumen');

  // Shared configured wallet state
  const [walletPolicy, setWalletPolicy] = useState<PolicyType>('single');
  const [walletScriptType, setWalletScriptType] = useState('Native Segwit (P2WPKH)');
  const [walletDescriptor, setWalletDescriptor] = useState('wpkh([A3F8E122]/crece/*)');
  const [walletKeystores, setWalletKeystores] = useState<Keystore[]>([defaultKeystores[0]]);
  const [walletTimelock, setWalletTimelock] = useState<TimelockConfig>({
    absoluteActive: false,
    absoluteValue: '2026-06-07',
    relativeActive: false,
    relativeValue: 30,
    allowNotifications: true
  });

  // Simulated Custom Import seed modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importWords, setImportWords] = useState(
    'semilla ataraxia merida libertad bitcoin yucatan custodia seguridad confianza facil amigable'
  );
  const [isImportingProgress, setIsImportingProgress] = useState(false);

  // Open particular glossary modal by id
  const handleOpenTerm = (termId: string) => {
    setActiveTermId(termId);
  };

  const handleCloseTerm = () => {
    setActiveTermId(null);
  };

  // Setup completion trigger
  const handleConfirmSetup = (config: {
    policyType: PolicyType;
    scriptType: string;
    descriptor: string;
    keystores: Keystore[];
    timelock: TimelockConfig;
  }) => {
    setWalletPolicy(config.policyType);
    setWalletScriptType(config.scriptType);
    setWalletDescriptor(config.descriptor);
    setWalletKeystores(config.keystores);
    setWalletTimelock(config.timelock);
    setDashboardInitialTab('resumen');
    setCurrentView('principal');
  };

  // Open standard pre-configured single-sig demo wallet directly
  const handleOpenDemoWallet = () => {
    setWalletPolicy('single');
    setWalletScriptType('Native Segwit (P2WPKH)');
    setWalletDescriptor('wpkh([A3F8E122]/crece/*)');
    setWalletKeystores([defaultKeystores[0]]);
    setWalletTimelock({
      absoluteActive: false,
      absoluteValue: '2026-06-07',
      relativeActive: false,
      relativeValue: 30,
      allowNotifications: true
    });
    setDashboardInitialTab('resumen');
    setCurrentView('principal');
  };

  // Execute simulated restore/import from mnemonic seed phrase
  const handleConfirmImport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsImportingProgress(true);

    setTimeout(() => {
      // Simulate successful sync
      setIsImportingProgress(false);
      setShowImportModal(false);

      // Setup imported states
      setWalletPolicy('single');
      setWalletScriptType('Native Segwit (P2WPKH)');
      setWalletDescriptor('wpkh([FEE730AA]/crece/*) [Sincronizado]');
      setWalletKeystores([
        {
          id: 'imported-ks',
          name: 'Billetera Recuperada (Español Seed)',
          type: 'magic-word',
          fingerprint: 'FEE730AA',
          keyData: '12 Palabras mágicas ingresadas con éxito'
        }
      ]);
      setWalletTimelock({
        absoluteActive: false,
        absoluteValue: '2026-06-07',
        relativeActive: true,
        relativeValue: 45,
        allowNotifications: true
      });

      setCurrentView('principal');
    }, 1500);
  };

  // Retrieve glossary metadata
  const activeGlossaryItem = activeTermId
    ? glossaryData.find((item) => item.id === activeTermId) || null
    : null;

  return (
    <div id="ataraxia-app-root" className="min-h-screen bg-[#F5F5F5] overflow-hidden font-sans relative antialiased selection:bg-brand-red/30 select-none">
      
      {/* Background static noise and ambiance grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* RENDER ACTIVE SCREEN CONTROLLER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          className="min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {currentView === 'inicio' && (
            <StartScreen
              onCreateWallet={() => setCurrentView('crear')}
              onOpenDemo={handleOpenDemoWallet}
              onImportMock={() => setShowImportModal(true)}
              onExploreGlossary={() => {
                // Take users straight to Glossary tab in principal
                setWalletPolicy('single');
                setWalletDescriptor('wpkh([A3F8E122]/crece/*)');
                setWalletKeystores([defaultKeystores[0]]);
                setDashboardInitialTab('fundamentos');
                setCurrentView('principal');
              }}
              onOpenTerm={handleOpenTerm}
            />
          )}

          {currentView === 'crear' && (
            <SetupScreen
              onBack={() => setCurrentView('inicio')}
              onConfirm={handleConfirmSetup}
              onOpenTerm={handleOpenTerm}
            />
          )}

          {currentView === 'principal' && (
            <DashboardScreen
              policyType={walletPolicy}
              scriptType={walletScriptType}
              descriptor={walletDescriptor}
              assignedKeystores={walletKeystores}
              timelockConfig={walletTimelock}
              onExit={() => setCurrentView('inicio')}
              onOpenTerm={handleOpenTerm}
              initialTab={dashboardInitialTab}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* RENDER INDEPENDENT GLOSSARY MODAL OVERLAY */}
      <GlossaryModal item={activeGlossaryItem} onClose={handleCloseTerm} />

      {/* SIMULATED MNEMONIC IMPORT MODAL */}
      <AnimatePresence>
        {showImportModal && (
          <div
            id="import-modal-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-sm"
            onClick={() => {
              if (!isImportingProgress) setShowImportModal(false);
            }}
          >
            <motion.div
              id="import-modal"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white border border-neutral-200 rounded-[32px] overflow-hidden p-8 shadow-2xl relative text-neutral-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                id="close-import-modal"
                disabled={isImportingProgress}
                onClick={() => setShowImportModal(false)}
                className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                title="Cerrar"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black font-display text-neutral-900 mb-2 flex items-center gap-2">
                <KeyRound className="text-brand-red animate-pulse" size={24} />
                Importar Wallet de Bitcoin
              </h3>
              <p className="text-xs text-neutral-500 mb-6 leading-normal">
                Escribe tu frase de recuperación de 12 o 24 palabras. En Ataraxia, todas las frases semilla se verifican de forma privada en el dispositivo de forma segura.
              </p>

              {isImportingProgress ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-neutral-100 border-t-brand-red animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-neutral-900">Sincronizando con Nodo Ataraxia...</h4>
                    <p className="text-[10px] text-neutral-400">Buscando salidas no gastadas (UTXOs) en Bitcoin Network</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmImport} className="space-y-5 text-xs">
                  <div>
                    <label className="block text-neutral-700 font-bold mb-1.5">
                      Palabras semilla (Español o Inglés)
                    </label>
                    <textarea
                      required
                      value={importWords}
                      onChange={(e) => setImportWords(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-neutral-950 font-mono leading-relaxed focus:border-brand-red focus:outline-none focus:bg-white"
                      placeholder="escribe las 12 palabras clave separadas por espacios..."
                    />
                    <div className="flex items-start gap-1.5 mt-3 bg-brand-yellow/10 p-3 rounded-xl border border-brand-yellow/20 text-[11px] text-yellow-800 leading-normal">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-yellow-700" />
                      <p>
                        <strong>Consejo de Autocustodia:</strong> En una billetera del mundo real, nunca debes pegar estas palabras en un navegador. Resguárdalas de forma física y confidencial.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-[#E60023] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/10 transition-transform hover:scale-[1.01]"
                    >
                      Verificar y Recuperar Saldo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
