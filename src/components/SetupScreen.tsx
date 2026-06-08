import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Settings,
  Shield,
  Users,
  Code,
  Key,
  Lock,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
  Download,
  FileText
} from 'lucide-react';
import { PolicyType, Keystore, KeystoreType, TimelockConfig } from '../types';
import { defaultKeystores } from '../data';
import { HelpTooltip } from './HelpTooltip';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const BIP39_LIST = [
  "abandon", "ability", "able", "about", "above", "baby", "bachelor", "bacon", "badge", "bag",
  "cabbage", "cabin", "cable", "cactus", "cage", "dad", "damage", "damp", "dance", "danger",
  "eager", "eagle", "early", "family", "famous", "fan", "galaxy", "gallery", "game", "hawk",
  "hazard", "hint", "item", "ivory", "joke", "journey", "joy", "kangaroo", "keen", "keep",
  "ketchup", "key", "laundry", "lava", "law", "magic", "magnet", "napkin", "narrow", "nasty",
  "olympic", "omit", "once", "paddle", "page", "pair", "quality", "quantum", "quarter", "rabbit",
  "raccoon", "race", "sad", "saddle", "sadness", "safe", "sail", "tail", "talent", "talk",
  "ugly", "umbrella", "unable", "valve", "van", "vanish", "warfare", "warm", "warrior", "yard",
  "year", "yellow", "zebra", "zero", "zoo"
];

interface SetupScreenProps {
  onBack: () => void;
  onConfirm: (config: {
    policyType: PolicyType;
    scriptType: string;
    descriptor: string;
    keystores: Keystore[];
    timelock: TimelockConfig;
  }) => void;
  onOpenTerm: (termId: string) => void;
}

interface RecoveryKeyItem {
  id: string;
  isOpen: boolean;
  type: 'Timelocker absoluto' | 'Timelocker relativo';
  availability: string; // e.g. "90 días, 11horas, 9 minutos"
  notifications: 'Sí' | 'No';
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onBack,
  onConfirm,
  onOpenTerm,
}) => {
  // Policy Mode: 'single' | 'multi'
  const [policyType, setPolicyType] = useState<PolicyType>('single');
  
  // Custom script type based on policy selection
  const [scriptType, setScriptType] = useState('Native Segwit (P2WPKH)');

  // Multisig choices: threshold representation
  const [multisigThreshold, setMultisigThreshold] = useState<string>('2 de 3');

  // Active Key Index inside the active keystore tab configuration (for Multisig view!)
  const [activeKeystoreIdx, setActiveKeystoreIdx] = useState<number>(0);

  // Keystores assigned
  const [selectedKeystores, setSelectedKeystores] = useState<Keystore[]>([
    {
      id: 'ks-main-1',
      name: 'H2 Bitcoin 2026',
      type: 'private-key',
      fingerprint: 'A3F8E122',
      keyData: 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]',
    }
  ]);

  // Collapsible recovery keys list matching Sparrow and Liana structure
  const [recoveryKeys, setRecoveryKeys] = useState<RecoveryKeyItem[]>([
    {
      id: 'rec-1',
      isOpen: true,
      type: 'Timelocker absoluto',
      availability: '2026-12-31',
      notifications: 'Sí'
    },
    {
      id: 'rec-2',
      isOpen: false,
      type: 'Timelocker relativo',
      availability: '90 d\u00edas, 11horas, 9 minutos',
      notifications: 'No'
    }
  ]);

  // States to control whether recovery keys section is activated and whether activation button is enabled
  const [recoveryKeysActivated, setRecoveryKeysActivated] = useState<boolean>(false);
  const [recoveryKeysButtonEnabled, setRecoveryKeysButtonEnabled] = useState<boolean>(false);

  // Handle active calendar selections
  const [activeCalendars, setActiveCalendars] = useState<{
    [key: string]: { month: number; year: number; isOpen: boolean };
  }>({});

  // Live editable or auto-updated descriptor state
  const [descriptorValue, setDescriptorValue] = useState<string>('wpkh(keystore1)');

  // Simulated notification alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Active Interactive Setup Modals
  const [activeKeystoreModal, setActiveKeystoreModal] = useState<'private-key' | 'magic-word' | 'hot-key' | 'xpub' | null>(null);

  // Modal State - Llave Privada
  const [privKeyPassword, setPrivKeyPassword] = useState('Bitcoinh2026');
  const [privKeyConfirmPassword, setPrivKeyConfirmPassword] = useState('Bitcoinh2026');
  const [showPrivKeyPassword, setShowPrivKeyPassword] = useState(false);
  const [showPrivKeyConfirmPassword, setShowPrivKeyConfirmPassword] = useState(false);

  // Modal State - Magic Word
  const [magicWordUses, setMagicWordUses] = useState(5);
  const [magicWordText, setMagicWordText] = useState('ROCA');

  // Modal State - Hotwallet Key
  const [hotKeyWordCount, setHotKeyWordCount] = useState(12);
  const [hotKeyWords, setHotKeyWords] = useState<string[]>([]);

  // Modal State - XPUB Watch-only
  const [xpubDeviceType, setXpubDeviceType] = useState('Airgapped wallet(Coldcard)');
  const [xpubFingerprint, setXpubFingerprint] = useState('08809f55');
  const [xpubDerivation, setXpubDerivation] = useState("m/52’/ 0’/12’/5’");
  const [xpubValue, setXpubValue] = useState('xpub6FPYM2UrngG1uBCyK9BMivaTUrWp5sP3Bqkkr85LzZ4YxT3GqmPDb2jtgYosGtnpmeybtHYSZEEry4a5M8Sqw5uvagN3vvT905ShJUk2e24');

  // Helper generator for BIP39 words
  const generateBip39Words = (count: number) => {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * BIP39_LIST.length);
      words.push(BIP39_LIST[idx]);
    }
    return words;
  };

  const handleOpenKeystoreModal = (type: 'private-key' | 'magic-word' | 'hot-key' | 'xpub') => {
    setActiveKeystoreModal(type);
    if (type === 'magic-word') {
      setMagicWordText('ROCA');
    } else if (type === 'hot-key') {
      setHotKeyWords(generateBip39Words(hotKeyWordCount));
    }
  };

  const handleDownloadColdkeyFile = () => {
    const fileContent = `Coldcard multisig setup file (created by Ataraxia)

Name: H2 Bitcoin 2026 Policy: 2 of 3 Derivation: m/52’/ 0’/12’/5’
Format: P2WHS

09609F55:xpub6FPYM2UrngG1uBCyK9BMivaTUrWp5sP3Bqkkr85LzZ4YxT3GqmPDb2jtgYosGtnpmeybtHYSZEEry4a5M8Sqw5uvagN3vvT905ShJUk2e24

74E16D4C:
xpub6EdvXkomRfHgGUJrNVwrrxaovZ6XYGVCQxUjHEtKME6fwBUyk3eZYisrSC6j1oRiGnzh5ctDpBzJL5XXYCfquLpVLPNqRw7G3SdGETRwzi8

C572949A:
xpub6Dig6DRhdoCceuBwW7gbQHyXEP9tGV7ELbhB1EGipnEbCA8iRhyeuZLGMiLzgivh9ZVBsvyeiK4xczMxj8rpM7rwmjXtgaAEC3xUk7L7EFBu

Structure of the xpub: [Master fingerprint, Derivation Path, xpub/zpub]

[08809f55/52’/ 0’/12’/5’]
xpub6FPYM2UrngG1uBCyK9BMivaTUrWp5sP3Bqkkr85LzZ4YxT3GqmPDb2jtgYosGtnpmeybtHYSZEEry4a5M8Sqw5uvagN3vvT905ShJUk2e24`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'H2COLDKEY2026.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToastAlert("📥 Archivo H2COLDKEY2026.txt descargado con éxito.");
  };

  // Auto-resize or pre-configure keystores when changing Policy or Threshold
  useEffect(() => {
    if (policyType === 'single') {
      setScriptType('Native Segwit (P2WPKH)');
      setActiveKeystoreIdx(0);
      
      // Keep only one primary single key
      setSelectedKeystores(prev => {
        const first = prev[0] || {
          id: 'ks-main-1',
          name: 'H2 Bitcoin 2026',
          type: 'private-key',
          fingerprint: 'A3F8E122',
          keyData: 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]',
        };
        return [{ ...first, name: first.name === 'Key #1' ? 'H2 Bitcoin 2026' : first.name }];
      });
    } else {
      setScriptType('Native Segwit (P2WSH)');
      
      // Determine needed count of keystores
      const [required, total] = multisigThreshold.split(' de ').map(Number);
      const countNeeded = total || 3;
      
      setSelectedKeystores(prev => {
        const updated = [...prev];
        // Shrink or grow to match countNeeded
        if (updated.length < countNeeded) {
          for (let i = updated.length; i < countNeeded; i++) {
            const defaultKey = defaultKeystores[i % defaultKeystores.length];
            updated.push({
              id: `ks-multi-${Date.now()}-${i}`,
              name: `Key #${i + 1}`,
              type: defaultKey.type === 'private-key' ? 'xpub' : defaultKey.type, // Mix it up nicely
              fingerprint: defaultKey.fingerprint,
              keyData: defaultKey.keyData,
              isCustom: true
            });
          }
        }
        const slice = updated.slice(0, countNeeded);
        // Force sequential Key names if they're default
        return slice.map((k, index) => {
          if (k.name.startsWith('Key #') || k.name === 'H2 Bitcoin 2026') {
            return { ...k, name: `Key #${index + 1}` };
          }
          return k;
        });
      });
      
      // Ensure active index is within bounds
      if (activeKeystoreIdx >= countNeeded) {
        setActiveKeystoreIdx(0);
      }
    }
  }, [policyType, multisigThreshold]);

  // Construct dynamic cryptographic descriptor matching user options
  useEffect(() => {
    const buildDescriptor = () => {
      let baseString = '';
      if (policyType === 'single') {
        if (scriptType === 'Legacy (P2PKH)') {
          baseString = 'pkh(Keystore1)';
        } else if (scriptType === 'Nested Segwit (P2SH-P2WPKH)') {
          baseString = 'sh(wpkh(Keystore1))';
        } else {
          // Native Segwit (P2WPKH) - default
          baseString = 'wpkh(keystore1)';
        }
      } else {
        // Multi signature:
        const [mStr, nStr] = multisigThreshold.split(' de ');
        const req = mStr || '2';
        const totalKeys = parseInt(nStr || '3', 10);
        const keyRefsList: string[] = [];
        for (let i = 1; i <= totalKeys; i++) {
          keyRefsList.push(`keystore${i}`);
        }
        const keyRefs = keyRefsList.join(', ');

        if (scriptType === 'Legacy (P2SH)') {
          baseString = `sh(sortedmulti(${req}, ${keyRefs}))`;
        } else if (scriptType === 'Nested Segwit (P2SH-P2WSH)') {
          baseString = `sh(wsh(sortedmulti(${req}, ${keyRefs})))`;
        } else {
          // Native Segwit (P2WSH) - default/fallback
          baseString = `wsh(sortedmulti(${req}, ${keyRefs}))`;
        }
      }

      setDescriptorValue(baseString);
    };

    buildDescriptor();
  }, [policyType, scriptType, selectedKeystores, multisigThreshold]);

  // Handle keystore parameter updates
  const updateActiveKeystore = (fields: Partial<Keystore>) => {
    setSelectedKeystores(prev => {
      const copy = [...prev];
      if (copy[activeKeystoreIdx]) {
        copy[activeKeystoreIdx] = {
          ...copy[activeKeystoreIdx],
          ...fields
        };
      }
      return copy;
    });
  };

  // Change keystore type, setting realistic descriptions
  const handleKeyTypeChange = (newType: KeystoreType) => {
    let keyData = '';
    let fingerprint = '00000000';
    
    if (newType === 'private-key') {
      keyData = 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]';
      fingerprint = 'A3F8E122';
    } else if (newType === 'magic-word') {
      keyData = '12 Palabras en Español / Billetera Semilla [Mnemonic BIP39]';
      fingerprint = 'B5D90F3A';
    } else if (newType === 'hot-key') {
      keyData = 'Secp256k1 Clave Efímera en Dispositivo Móvil';
      fingerprint = '9CE543BD';
    } else if (newType === 'xpub') {
      keyData = 'xpub661MyMwAqRbcFtXeN9g9hcK8wL6wN9g5xQpUtW4d... [Ver Solo]';
      fingerprint = '7D1A2C3E';
    }

    updateActiveKeystore({
      type: newType,
      keyData,
      fingerprint
    });

    // Notify user of type update
    showToastAlert(`Tipo de llave cambiado a: ${
      newType === 'private-key' ? 'Llave Privada' :
      newType === 'magic-word' ? 'Frase Semilla (Magic Word)' :
      newType === 'hot-key' ? 'Hot Key Móvil' : 'Extended XPUB (Watch-only)'
    }`);
  };

  // Toast alert flash
  const showToastAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => {
      setAlertMsg(null);
    }, 2800);
  };

  // Toggle Collapse on a recovery key
  const toggleRecoveryCollapse = (id: string) => {
    setRecoveryKeys(prev =>
      prev.map(item => item.id === id ? { ...item, isOpen: !item.isOpen } : item)
    );
  };

  // Edit fields on specific recovery key
  const updateRecoveryKey = (id: string, fields: Partial<RecoveryKeyItem>) => {
    setRecoveryKeys(prev =>
      prev.map(item => item.id === id ? { ...item, ...fields } : item)
    );
  };

  // Calendar actions
  const handlePrevMonth = (recId: string) => {
    setActiveCalendars(prev => {
      const current = prev[recId] || { month: 5, year: 2026, isOpen: true }; // June 2026 default
      let newMonth = current.month - 1;
      let newYear = current.year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      return {
        ...prev,
        [recId]: { ...current, month: newMonth, year: newYear }
      };
    });
  };

  const handleNextMonth = (recId: string) => {
    setActiveCalendars(prev => {
      const current = prev[recId] || { month: 5, year: 2026, isOpen: true }; // June 2026 default
      let newMonth = current.month + 1;
      let newYear = current.year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      return {
        ...prev,
        [recId]: { ...current, month: newMonth, year: newYear }
      };
    });
  };

  const handleSelectDate = (recId: string, dayNum: number) => {
    const current = activeCalendars[recId] || { month: 5, year: 2026, isOpen: true };
    const monthFormatted = String(current.month + 1).padStart(2, '0');
    const dayFormatted = String(dayNum).padStart(2, '0');
    const dateString = `${current.year}-${monthFormatted}-${dayFormatted}`;
    
    updateRecoveryKey(recId, { availability: dateString });
    showToastAlert(`Fecha establecida: ${dateString}`);
  };

  const handleSelectPresetDate = (recId: string, fullDate: string) => {
    const parts = fullDate.split('-');
    if (parts.length === 3) {
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10) - 1;
      setActiveCalendars(prev => {
        const current = prev[recId] || { month: 5, year: 2026, isOpen: true };
        return {
          ...prev,
          [recId]: { ...current, month: mo, year: yr }
        };
      });
    }
    updateRecoveryKey(recId, { availability: fullDate });
    showToastAlert(`Fecha establecida: ${fullDate}`);
  };

  const renderCalendarDays = (recId: string, currentVal: string) => {
    const current = activeCalendars[recId] || { month: 5, year: 2026, isOpen: true };
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
    // Week starts Sunday (0) to Saturday (6)
    const firstDayIndex = new Date(current.year, current.month, 1).getDay();

    const dayCells: React.ReactNode[] = [];

    // Alignment empty items
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(<div key={`empty-${recId}-${i}`} className="h-7 w-7" />);
    }

    // Selected state checker
    let selectedDay = -1;
    let selectedMonth = -1;
    let selectedYear = -1;
    
    const parts = currentVal.split('-');
    if (parts.length === 3) {
      selectedYear = parseInt(parts[0], 10);
      selectedMonth = parseInt(parts[1], 10) - 1;
      selectedDay = parseInt(parts[2], 10);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDay === day && selectedMonth === current.month && selectedYear === current.year;
      
      dayCells.push(
        <button
          key={`day-${recId}-${day}`}
          type="button"
          onClick={() => handleSelectDate(recId, day)}
          className={`h-7 w-7 text-[10px] font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            isSelected 
              ? 'bg-[#E60023] text-white font-extrabold scale-105' 
              : 'hover:bg-neutral-100 text-neutral-850 hover:text-black'
          }`}
        >
          {day}
        </button>
      );
    }

    return dayCells;
  };

  // Append new recovery key card
  const handleAddRecoveryKey = () => {
    const newId = `rec-${Date.now()}`;
    const nextNum = recoveryKeys.length + 1;
    const isAbsolute = nextNum % 2 !== 0; // standard alternation

    setRecoveryKeys(prev => [
      ...prev.map(c => ({ ...c, isOpen: false })), // collapse old ones for neat view
      {
        id: newId,
        isOpen: true,
        type: isAbsolute ? 'Timelocker absoluto' : 'Timelocker relativo',
        availability: isAbsolute ? '2026-12-31' : '90 días, 11horas, 9 minutos',
        notifications: 'Sí'
      }
    ]);
    showToastAlert(`Recovery Key #${nextNum} agregada con éxito de forma interactiva.`);
  };

  // Remove a recovery key path if needed
  const handleRemoveRecoveryKey = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (recoveryKeys.length <= 1) {
      showToastAlert("Debes mantener al menos una llave de recuperación/timelock activa.");
      return;
    }
    setRecoveryKeys(prev => prev.filter(item => item.id !== id));
    showToastAlert("Locker de recuperación removido de la política de gasto.");
  };

  // Simulated Edit/Generate Keys flow (entropy refresh alert)
  const handleSimulateEditKeys = () => {
    // Generate new fingerprints for currently active keys
    setSelectedKeystores(prev =>
      prev.map(k => {
        const randomFp = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
        return {
          ...k,
          fingerprint: randomFp,
          keyData: k.keyData.replace(/Fingerprint: [A-Z0-9]+/, `Fingerprint: ${randomFp}`)
        };
      })
    );
    showToastAlert("¡Dispositivos de firma editados! Nuevos parámetros criptográficos y huellas generadas.");
  };

  // Submit onConfirm
  const handleAceptarConfig = () => {
    // Pack current config
    const mappedTimelock: TimelockConfig = {
      absoluteActive: recoveryKeys.some(r => r.type === 'Timelocker absoluto'),
      absoluteValue: '2026-12-31',
      relativeActive: recoveryKeys.some(r => r.type === 'Timelocker relativo'),
      relativeValue: recoveryKeys.some(r => r.availability.includes('90')) ? 90 : 30,
      allowNotifications: recoveryKeys.some(r => r.notifications === 'Sí')
    };

    onConfirm({
      policyType,
      scriptType,
      descriptor: descriptorValue,
      keystores: selectedKeystores,
      timelock: mappedTimelock
    });
  };

  // Current active key in the form
  const activeKey = selectedKeystores[activeKeystoreIdx] || {
    name: 'H2 Bitcoin 2026',
    type: 'private-key',
    fingerprint: 'A3F8E122',
    keyData: ''
  };

  return (
    <div id="setup-screen" className="min-h-screen p-4 md:p-8 bg-[#FAFAFA] text-neutral-900 w-full font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation / Header Row */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs md:text-sm text-neutral-600 hover:text-neutral-900 transition-all font-semibold py-1.5 px-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            Regresar al Menú
          </button>
          
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-[#E60023] font-mono font-black block">Ataraxia Multicustodia v1.0</span>
            <span className="text-[11px] text-gray-500 font-bold">Simulación Sparrow / Liana Integrada</span>
          </div>
        </div>

        {/* Dynamic Micro Alert Toast */}
        <AnimatePresence>
          {alertMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-neutral-800"
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>{alertMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand Header exact representation */}
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-[24px] flex items-center gap-5 shadow-sm text-left">
          {/* Custom Ataraxia graphic logo */}
          <div className="w-16 h-16 rounded-[20px] bg-[#E60023] shrink-0 flex items-center justify-center p-3.5 shadow-md shadow-red-500/10">
            {/* Custom stylized A representation built beautifully with SVG */}
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-white stroke-[9]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 85 L50 15 L85 85"/>
              <path d="M30 60 L70 60"/>
              <path d="M50 15 L50 60" strokeDasharray="4 4" strokeWidth="4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight font-sans">
              Has creado una nueva Wallet
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-semibold mt-0.5 max-w-xl">
              ¿Quieres modificar nuestra configuración predeterminada? Configura y personaliza las llaves del descriptor para tu máxima seguridad.
            </p>
          </div>
        </div>

        {/* Main Grid Layout to fit settings & cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
          
          {/* LEFT PANEL: CONFIGURACIONES */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-[24px] shadow-sm space-y-6">
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                Configuraciones
              </h3>

              {/* Policy Type dropdown container */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 block">Tipo de Poliza:</label>
                <div className="relative">
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value as PolicyType)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="single">Single signature</option>
                    <option value="multi">Multi Signature</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Multisig Choices - conditional input */}
              {policyType === 'multi' && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-xs font-bold text-neutral-600 block">Firmas requeridas:</label>
                  <div className="relative">
                    <select
                      value={multisigThreshold}
                      onChange={(e) => setMultisigThreshold(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="2 de 3">2 de 3</option>
                      <option value="3 de 5">3 de 5</option>
                      <option value="1 de 2">1 de 2</option>
                      <option value="2 de 2">2 de 2</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              )}

              {/* Script Type dropdown container */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 block">Tipo de Script:</label>
                <div className="relative">
                  <select
                    value={scriptType}
                    onChange={(e) => setScriptType(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none appearance-none shadow-sm cursor-pointer"
                  >
                    {policyType === 'single' ? (
                      <>
                        <option value="Legacy (P2PKH)">Legacy (P2PKH)</option>
                        <option value="Native Segwit (P2WPKH)">Native Segwit (P2WPKH)</option>
                        <option value="Nested Segwit (P2SH-P2WPKH)">Nested Segwit (P2SH-P2WPKH)</option>
                      </>
                    ) : (
                      <>
                        <option value="Legacy (P2SH)">Legacy (P2SH)</option>
                        <option value="Nested Segwit (P2SH-P2WSH)">Nested Segwit (P2SH-P2WSH)</option>
                        <option value="Native Segwit (P2WSH)">Native Segwit (P2WSH)</option>
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Descriptor text display box (matches drawing input) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-600 block">Descriptor:</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    readOnly
                    value={descriptorValue}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).select();
                      navigator.clipboard.writeText(descriptorValue);
                      showToastAlert("¡Descriptor copiado al portapapeles!");
                    }}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-mono text-neutral-800 outline-none shadow-inner cursor-pointer transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(descriptorValue);
                        showToastAlert("¡Descriptor copiado al portapapeles!");
                      }}
                      className="bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white text-[10px] font-mono px-3 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E60023] animate-pulse"></span>
                      CLICK COPIAR
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: KEYSTORE & TIMELOCKERS */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-[24px] shadow-sm space-y-6">
              
              <div>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-1 font-sans">
                  Keystore y Timelockers!
                </h3>
                <p className="text-[11px] text-gray-500 leading-normal font-semibold font-sans">
                  Aquí encontrarás todas tus llaves principales y de recuperación. Recuerda, mientras más llaves crees, mayor seguridad tendrá tu Wallet.
                </p>
              </div>

              {/* CONTAINER: ADHERIR KEYSTORE */}
              <div className="p-5 border border-gray-300 rounded-[20px] bg-white space-y-4 relative">
                <span className="text-[10px] font-bold text-neutral-400 absolute right-4 top-4 font-mono">
                  {policyType === 'single' ? 'SINGLE-SIG' : `MULTISIG ${multisigThreshold}`}
                </span>
                
                <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider block">
                  Adherir Keystore:
                </h4>

                {/* Multitouch Keystores Switcher Tabs for Multisig (Image 2) */}
                {policyType === 'multi' && (
                  <div className="flex flex-wrap gap-1.5 bg-neutral-100 p-1.5 rounded-xl border border-gray-200">
                    {selectedKeystores.map((k, idx) => (
                      <button
                        type="button"
                        key={k.id}
                        onClick={() => setActiveKeystoreIdx(idx)}
                        className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeKeystoreIdx === idx
                            ? 'bg-neutral-900 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                        }`}
                      >
                        Key #{idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Nombre de la Key input fields */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Nombre de la Key:</label>
                  <input
                    type="text"
                    value={activeKey.name}
                    onChange={(e) => updateActiveKeystore({ name: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none shadow-sm"
                    placeholder="Nombre identificador"
                  />
                </div>

                {/* Device Type flat outline row (Image 1 & 2 layout buttons) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600 block">Tipo de llave:</label>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* BUTTON LLaVE PRIVADA */}
                    <button
                      type="button"
                      onClick={() => handleOpenKeystoreModal('private-key')}
                      className={`py-3 px-2.5 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                        activeKey.type === 'private-key'
                          ? 'border-neutral-900 bg-neutral-50 text-neutral-900 border-2 font-black shadow-inner scale-[1.01]'
                          : 'border-gray-200 bg-white hover:bg-neutral-50 text-neutral-600 font-bold'
                      }`}
                    >
                      <Key size={16} className={activeKey.type === 'private-key' ? 'text-red-600' : 'text-gray-400'} />
                      <span className="text-[10px] leading-tight block">Llave Privada</span>
                    </button>

                    {/* BUTTON MAGIC WORD */}
                    <button
                      type="button"
                      onClick={() => handleOpenKeystoreModal('magic-word')}
                      className={`py-3 px-2.5 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                        activeKey.type === 'magic-word'
                          ? 'border-neutral-900 bg-neutral-50 text-neutral-900 border-2 font-black shadow-inner scale-[1.01]'
                          : 'border-gray-200 bg-white hover:bg-neutral-50 text-neutral-600 font-bold'
                      }`}
                    >
                      <FileText size={16} className={activeKey.type === 'magic-word' ? 'text-purple-600' : 'text-gray-400'} />
                      <span className="text-[10px] leading-tight block">Magic word</span>
                    </button>

                    {/* BUTTON HOTWALLET KEY */}
                    <button
                      type="button"
                      onClick={() => handleOpenKeystoreModal('hot-key')}
                      className={`py-3 px-2.5 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                        activeKey.type === 'hot-key'
                          ? 'border-neutral-900 bg-neutral-50 text-neutral-900 border-2 font-black shadow-inner scale-[1.01]'
                          : 'border-gray-200 bg-white hover:bg-neutral-50 text-neutral-600 font-bold'
                      }`}
                    >
                      <Smartphone size={16} className={activeKey.type === 'hot-key' ? 'text-blue-600' : 'text-gray-400'} />
                      <span className="text-[10px] leading-tight block">Hotwallet Key</span>
                    </button>

                    {/* BUTTON XPUB/WATCH ONLY */}
                    <button
                      type="button"
                      onClick={() => handleOpenKeystoreModal('xpub')}
                      className={`py-3 px-2.5 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                        activeKey.type === 'xpub'
                          ? 'border-neutral-900 bg-neutral-50 text-neutral-900 border-2 font-black shadow-inner scale-[1.01]'
                          : 'border-gray-200 bg-white hover:bg-neutral-50 text-neutral-600 font-bold'
                      }`}
                    >
                      <Eye size={16} className={activeKey.type === 'xpub' ? 'text-amber-600' : 'text-gray-400'} />
                      <span className="text-[10px] leading-tight block line-clamp-1">xpub/watchonly</span>
                    </button>
                  </div>
                </div>

                {/* Device hardware ID output */}
                <div className="p-3 bg-neutral-50 border border-gray-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-400 font-mono">FINGERPRINT ID:</span>
                    <div className="flex items-center gap-1.5">
                      {activeKey.type === 'magic-word' && (
                        <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">
                          🔑 ROCA ({magicWordUses} usos disponibles)
                        </span>
                      )}
                      <span className="text-[10px] bg-neutral-900 text-white font-mono px-1.5 py-0.5 rounded leading-none">
                        {activeKey.fingerprint || '00000000'}
                      </span>
                    </div>
                  </div>
                  <span className="block text-[10px] font-mono text-gray-500 leading-tight truncate">
                    {activeKey.keyData || 'Información de hardware no inicializada'}
                  </span>
                </div>

              </div>

              {/* RECOVERY PATHS (COLLAPSIBLE CARDS) */}
              <div className="space-y-3.5">
                
                {/* Header and Adding button matching draft layout */}
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                    Recovery Keys
                    {!recoveryKeysActivated && (
                      <span className="text-[9px] bg-neutral-150 text-neutral-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Inactivo
                      </span>
                    )}
                  </h4>
                  
                  {/* Styled like [Adherir Recovery Key +] in mockup sketch (Only visible when active) */}
                  {recoveryKeysActivated && (
                    <button
                      type="button"
                      onClick={handleAddRecoveryKey}
                      className="border border-neutral-900 px-3 py-1.5 rounded-full text-[11px] font-black hover:bg-neutral-50 text-neutral-900 shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] transition-transform"
                    >
                      Adherir Recovery Key
                      <Plus size={14} className="stroke-[3]" />
                    </button>
                  )}
                </div>

                {!recoveryKeysActivated ? (
                  <div className="p-5 border border-dashed border-neutral-300 rounded-[24px] bg-neutral-50/40 space-y-4">
                    {/* Toggle Switch to unlock activation */}
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-xs gap-3">
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-extrabold text-neutral-800">Permitir configuración de Recovery Keys</span>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Habilita esta opción para activar los timelocks absolutos o relativos de seguridad de base.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input
                          type="checkbox"
                          checked={recoveryKeysButtonEnabled}
                          onChange={(e) => setRecoveryKeysButtonEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
                      </label>
                    </div>

                    {/* Activation button (disabled by default) */}
                    <button
                      type="button"
                      disabled={!recoveryKeysButtonEnabled}
                      onClick={() => {
                        setRecoveryKeysActivated(true);
                        showToastAlert("🔓 Sección RECOVERY KEYS activada y desplegada.");
                      }}
                      className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black transition-all text-center flex items-center justify-center gap-2 shadow-xs ${
                        recoveryKeysButtonEnabled
                          ? 'bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 cursor-pointer border border-transparent'
                          : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Lock size={14} className={recoveryKeysButtonEnabled ? 'text-red-500' : 'text-neutral-400'} />
                      Activar RECOVERY KEYS
                    </button>
                  </div>
                ) : (
                  /* Collapsible item rendering */
                  <div className="space-y-3">
                    {recoveryKeys.map((rec, index) => (
                      <div
                        key={rec.id}
                        className="border border-neutral-300 rounded-[20px] bg-white overflow-hidden shadow-sm"
                      >
                        {/* Collapsible key header - clicking toggles slide */}
                        <div
                          onClick={() => toggleRecoveryCollapse(rec.id)}
                          className="p-4 bg-neutral-50 flex items-center justify-between border-b border-gray-200 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2">
                            <Lock size={14} className="text-red-500" />
                            <span className="text-xs font-black text-neutral-800">
                              Recovery Key #{index + 1}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {recoveryKeys.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveRecoveryKey(rec.id, e)}
                                className="p-1 hover:text-red-600 text-gray-400 rounded transition-colors"
                                title="Remover llave de recuperación"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                            {rec.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
  
                        {/* Expandable fields drawer */}
                        {rec.isOpen && (
                          <div className="p-5 space-y-4 animate-fade-in text-xs">
                            {/* 1. Tipo de recovery key */}
                            <div className="space-y-1.5 text-left">
                              <span className="font-bold text-neutral-600 block">Typo de Recovery Key:</span>
                              <div className="relative">
                                <select
                                  value={rec.type}
                                onChange={(e) => {
                                  const rawType = e.target.value as 'Timelocker absoluto' | 'Timelocker relativo';
                                  const defaultAv = rawType === 'Timelocker absoluto' ? '2026-12-31' : '90 días, 11horas, 9 minutos';
                                  
                                  // Update state
                                  updateRecoveryKey(rec.id, {
                                    type: rawType,
                                    availability: defaultAv
                                  });

                                  // Auto-open calendar if absolute is selected
                                  if (rawType === 'Timelocker absoluto') {
                                    setActiveCalendars(prev => ({
                                      ...prev,
                                      [rec.id]: { month: 11, year: 2026, isOpen: true } // Dec 2026
                                    }));
                                    showToastAlert("Timelocker absoluto activado. ¡Configura la fecha en el mini calendario!");
                                  } else {
                                    setActiveCalendars(prev => ({
                                      ...prev,
                                      [rec.id]: { month: 5, year: 2026, isOpen: false }
                                    }));
                                    showToastAlert("Timelocker relativo activado.");
                                  }
                                }}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:border-red-500 outline-none appearance-none cursor-pointer"
                              >
                                <option value="Timelocker absoluto">Timelocker absoluto</option>
                                <option value="Timelocker relativo">Timelocker relativo</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>

                          {/* 2. Disponibilidad (Conditional Output) */}
                          {rec.type === 'Timelocker relativo' ? (
                            // Relative Type (Plain Text Input)
                            <div className="space-y-1.5 text-left">
                              <span className="font-bold text-neutral-600 block">Disponibilidad (Relativo):</span>
                              <input
                                type="text"
                                value={rec.availability}
                                onChange={(e) => updateRecoveryKey(rec.id, { availability: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:border-red-500 outline-none"
                                placeholder="ej. 90 días, 11horas, 9 minutos"
                              />
                              <p className="text-[10px] text-gray-400 italic font-medium leading-tight">
                                Establece los parámetros del timelock relativo antes de que se habilite esta llave de respaldo.
                              </p>
                            </div>
                          ) : (
                            // Absolute Type (Clickable field displaying datepicker calendar)
                            <div className="space-y-1.5 text-left">
                              <span className="font-bold text-neutral-600 block">Disponibilidad (Absoluto - Fecha Límite):</span>
                              
                              <div className="relative">
                                <input
                                  type="text"
                                  readOnly
                                  value={rec.availability}
                                  onClick={() => {
                                    setActiveCalendars(prev => {
                                      const current = prev[rec.id] || { month: 11, year: 2026, isOpen: false };
                                      return {
                                        ...prev,
                                        [rec.id]: {
                                          ...current,
                                          isOpen: !current.isOpen
                                        }
                                      };
                                    });
                                  }}
                                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-28 py-2.5 text-xs font-black text-neutral-800 focus:border-red-500 outline-none cursor-pointer hover:border-red-500 hover:bg-neutral-50/50 transition-all font-mono"
                                  placeholder="Haz click para abrir el calendario"
                                />
                                <div className="absolute left-3.5 top-3 text-red-500">
                                  <Calendar size={14} />
                                </div>
                                <div className="absolute right-2 top-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveCalendars(prev => {
                                        const current = prev[rec.id] || { month: 11, year: 2026, isOpen: false };
                                        return { ...prev, [rec.id]: { ...current, isOpen: !current.isOpen } };
                                      });
                                    }}
                                    className="bg-[#E60023]/10 hover:bg-[#E60023]/20 text-[#E60023] text-[9px] font-black px-2.5 py-1.5 rounded-lg border border-[#E60023]/25 flex items-center gap-1 transition-all"
                                  >
                                    <Sparkles size={10} />
                                    {activeCalendars[rec.id]?.isOpen ? 'Cerrar' : 'Calendario'}
                                  </button>
                                </div>
                              </div>

                              <p className="text-[10px] text-gray-400 italic font-medium leading-tight">
                                Establece la fecha exacta del bloqueo absoluto. Haz clic en el campo o en el botón "Calendario" para ver el mini calendario interactivo.
                              </p>

                              {/* Interactive custom mini-datepicker */}
                              {activeCalendars[rec.id]?.isOpen && (
                                <div className="p-4 mt-2 bg-neutral-50/70 border border-neutral-200 rounded-[18px] shadow-inner space-y-3 relative z-10 transition-all max-w-[280px] mx-auto">
                                  {/* Month Navigation Header */}
                                  <div className="flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => handlePrevMonth(rec.id)}
                                      className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors cursor-pointer"
                                    >
                                      <ChevronLeft size={15} />
                                    </button>
                                    
                                    <span className="text-xs font-black text-neutral-800">
                                      {MONTH_NAMES[activeCalendars[rec.id]?.month ?? 11]} {activeCalendars[rec.id]?.year ?? 2026}
                                    </span>
                                    
                                    <button
                                      type="button"
                                      onClick={() => handleNextMonth(rec.id)}
                                      className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors cursor-pointer"
                                    >
                                      <ChevronRight size={15} />
                                    </button>
                                  </div>

                                  {/* Calendar Day Titles */}
                                  <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-neutral-400 uppercase">
                                    <span>Do</span>
                                    <span>Lu</span>
                                    <span>Ma</span>
                                    <span>Mi</span>
                                    <span>Ju</span>
                                    <span>Vi</span>
                                    <span>Sá</span>
                                  </div>

                                  {/* Calendar Days Matrix */}
                                  <div className="grid grid-cols-7 gap-1 text-center">
                                    {renderCalendarDays(rec.id, rec.availability)}
                                  </div>

                                  {/* Presets and Confirmation Footer Options */}
                                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-gray-200">
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectPresetDate(rec.id, '2026-12-31')}
                                        className="text-[9px] font-bold bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer transition-colors"
                                      >
                                        Fin 2026
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSelectPresetDate(rec.id, '2027-06-30')}
                                        className="text-[9px] font-bold bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg px-2 py-1 cursor-pointer transition-colors"
                                      >
                                        Jun 2027
                                      </button>
                                    </div>
                                    
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveCalendars(prev => ({
                                          ...prev,
                                          [rec.id]: {
                                            ...(prev[rec.id] || { month: 11, year: 2026 }),
                                            isOpen: false
                                          }
                                        }));
                                      }}
                                      className="text-[9px] font-black bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg px-3 py-1 cursor-pointer transition-colors"
                                    >
                                      Aceptar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 3. Notificaciones */}
                          <div className="space-y-1.5 text-left">
                            <span className="font-bold text-neutral-600 block">Notificaciones:</span>
                            <div className="relative">
                              <select
                                value={rec.notifications}
                                onChange={(e) => updateRecoveryKey(rec.id, { notifications: e.target.value as any })}
                                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:border-red-500 outline-none appearance-none cursor-pointer"
                              >
                                <option value="Sí">Sí</option>
                                <option value="No">No</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              </div>

              {/* Lower Section Buttons MATCHING LAYOUT SPEC */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-150">
                {/* [Editar Keys] button on the lower-left */}
                <button
                  type="button"
                  onClick={handleSimulateEditKeys}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-neutral-900 rounded-[12px] text-xs font-black text-neutral-900 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  Editar Keys
                </button>

                {/* [Aceptar] button on the lower-right */}
                <button
                  type="button"
                  onClick={handleAceptarConfig}
                  className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-[12px] text-xs font-black select-none transition-all cursor-pointer shadow-md shadow-neutral-900/10 hover:scale-[1.01]"
                >
                  Aceptar
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Keystore Config Modals */}
      <AnimatePresence>
        {activeKeystoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[28px] border border-gray-200 shadow-2xl p-6 md:p-8 w-full max-w-lg text-left overflow-y-auto max-h-[90vh] relative"
            >
              {activeKeystoreModal === 'private-key' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-950">Llave Privada</h3>
                      <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Configuración de seguridad</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-xs text-amber-800 font-medium leading-relaxed flex gap-2.5">
                    <span className="text-base">⚠️</span>
                    <p>
                      Recuerda, resguárdala bien y nunca compartir tu llave privada, ya que con ella eres capaz de localizar esta wallet y acceder a ella.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Contraseña:</label>
                      <div className="relative">
                        <input
                          type={showPrivKeyPassword ? "text" : "password"}
                          value={privKeyPassword}
                          onChange={(e) => setPrivKeyPassword(e.target.value)}
                          className="w-full bg-neutral-50 hover:bg-neutral-100/50 border border-gray-300 rounded-xl pl-3.5 pr-11 py-3 text-xs font-bold text-neutral-800 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all font-mono"
                          placeholder="Contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPrivKeyPassword(!showPrivKeyPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                        >
                          {showPrivKeyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 block">Confirma contraseña:</label>
                      <div className="relative">
                        <input
                          type={showPrivKeyConfirmPassword ? "text" : "password"}
                          value={privKeyConfirmPassword}
                          onChange={(e) => setPrivKeyConfirmPassword(e.target.value)}
                          className="w-full bg-neutral-50 hover:bg-neutral-100/50 border border-gray-300 rounded-xl pl-3.5 pr-11 py-3 text-xs font-bold text-neutral-800 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all font-mono"
                          placeholder="Confirma contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPrivKeyConfirmPassword(!showPrivKeyConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                        >
                          {showPrivKeyConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveKeystoreModal(null)}
                      className="flex-1 py-3 text-xs font-black border border-gray-300 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (privKeyPassword !== privKeyConfirmPassword) {
                          showToastAlert("❌ Las contraseñas no coinciden.");
                          return;
                        }
                        updateActiveKeystore({
                          type: 'private-key',
                          fingerprint: 'A3F8E122',
                          keyData: 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]'
                        });
                        setActiveKeystoreModal(null);
                        showToastAlert("✅ Llave Privada configurada y guardada locales.");
                      }}
                      className="flex-1 py-3 text-xs font-black bg-neutral-950 text-white rounded-xl hover:bg-neutral-850 active:scale-95 transition-all text-center cursor-pointer shadow-md shadow-neutral-900/10"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}

              {activeKeystoreModal === 'magic-word' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                      🪄
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-950">Magic Word!</h3>
                      <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Uso Temporal Restringido</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#E60023]/5 border border-[#E60023]/10 rounded-2xl text-xs text-[#E60023] font-medium leading-relaxed flex gap-2.5">
                    <span className="text-base">⚠️</span>
                    <p>
                      Recuerda, las Keys del tipo “Magic Word!” son de uso temporal, es decir, una vez la emplees el número de veces que haz definido, dejarán de funcionar y necesitarás generar otra Key o habilitar una Recovery Key.
                      <br /><strong className="text-[#E60023]">Por lo tanto, NUNCA uses una Key del tipo “Magic Word” cómo única para acceder a tu wallet.</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-neutral-700 block">Usos (1-10):</label>
                      <div className="relative">
                        <select
                          value={magicWordUses}
                          onChange={(e) => setMagicWordUses(Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none appearance-none shadow-sm cursor-pointer font-mono"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(u => (
                            <option key={u} value={u}>{u} {u === 1 ? 'uso' : 'usos'}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-gray-200 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-gray-400 font-mono tracking-wider font-extrabold block">SU LLAVE MAGIC WORD:</span>
                      <span className="text-lg font-black text-purple-700 font-mono select-all tracking-widest">{magicWordText}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveKeystoreModal(null)}
                      className="flex-1 py-3 text-xs font-black border border-gray-300 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateActiveKeystore({
                          type: 'magic-word',
                          fingerprint: 'B5D90F3A',
                          keyData: `12 Palabras en Español / Billetera Semilla [Mnemonic BIP39] - Uso temporal (${magicWordUses} usos restantes)`
                        });
                        setActiveKeystoreModal(null);
                        showToastAlert(`✅ Magic Word guardado con ${magicWordUses} usos disponibles.`);
                      }}
                      className="flex-1 py-3 text-xs font-black bg-neutral-950 text-white rounded-xl hover:bg-neutral-850 active:scale-95 transition-all text-center cursor-pointer shadow-md shadow-neutral-900/10"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}

              {activeKeystoreModal === 'hot-key' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-950">Hotwallet Key</h3>
                      <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Generador de semilla BIP39</p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                    Aquí se te generará un orden de palabras aleatorio con base al formato estandarizado de creación de palabras semilla en carteras de bitcoin “BIP39”.
                  </p>

                  <div className="p-3.5 bg-amber-50 border border-amber-200/50 rounded-xl text-xs text-amber-850 font-medium leading-relaxed flex gap-2">
                    <span className="text-sm">📝</span>
                    <p>
                      <strong className="text-amber-900 font-bold">Nota:</strong> Toma una captura de pantalla o apunta las palabras en un lugar seguro para utilizar la llave más adelante.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-neutral-700 block">Número de palabras:</label>
                      <div className="relative">
                        <select
                          value={hotKeyWordCount}
                          onChange={(e) => {
                            const newCount = Number(e.target.value);
                            setHotKeyWordCount(newCount);
                            // immediately regenerate
                            setHotKeyWords(generateBip39Words(newCount));
                          }}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none shadow-sm cursor-pointer font-mono"
                        >
                          {[12, 15, 18, 21, 24].map(c => (
                            <option key={c} value={c}>{c} Palabras</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setHotKeyWords(generateBip39Words(hotKeyWordCount));
                          showToastAlert("🚀 Frase semilla generada aleatoriamente.");
                        }}
                        className="flex-grow py-3 text-xs font-black bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl shadow-sm cursor-pointer transition-colors"
                      >
                        {hotKeyWords.length > 0 ? 'Generar otra vez' : 'Generar frase'}
                      </button>
                    </div>

                    {hotKeyWords.length > 0 && (
                      <div className="space-y-2.5 p-4 bg-neutral-50/70 border border-gray-200 rounded-2xl">
                        <span className="text-[10px] text-gray-400 font-mono tracking-wider font-extrabold block">TU FRASE ES:</span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 font-mono text-xs text-neutral-800">
                          {hotKeyWords.map((word, i) => (
                            <div key={i} className="flex gap-1.5">
                              <span className="text-neutral-400 font-bold w-5 text-right">{i+1}.</span>
                              <span className="font-extrabold text-neutral-950 select-all">{word}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveKeystoreModal(null)}
                      className="flex-1 py-3 text-xs font-black border border-gray-300 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      disabled={hotKeyWords.length === 0}
                      onClick={() => {
                        const joined = hotKeyWords.join(' ');
                        updateActiveKeystore({
                          type: 'hot-key',
                          fingerprint: '9CE543BD',
                          keyData: `Mnemonic BIP39 (${hotKeyWordCount} p.): ${joined.substring(0, 30)}...`
                        });
                        setActiveKeystoreModal(null);
                        showToastAlert("✅ Hotwallet Key guardada locales de forma segura.");
                      }}
                      className="flex-1 py-3 text-xs font-black bg-neutral-950 text-white rounded-xl hover:bg-neutral-850 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-center cursor-pointer shadow-md shadow-neutral-900/10"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}

              {activeKeystoreModal === 'xpub' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Eye size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-950">xpub/watchonly</h3>
                        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Sincronización watch-only</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleDownloadColdkeyFile}
                      className="bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-gray-300 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      Exportar...
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-neutral-700 block">Tipo:</label>
                      <input
                        type="text"
                        value={xpubDeviceType}
                        onChange={(e) => setXpubDeviceType(e.target.value)}
                        className="w-full bg-neutral-50 hover:bg-neutral-100/50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-850 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 outline-none transition-all"
                        placeholder="Airgapped wallet(Coldcard)"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-neutral-700 block">Master fingerprint:</label>
                      <input
                        type="text"
                        value={xpubFingerprint}
                        onChange={(e) => setXpubFingerprint(e.target.value)}
                        className="w-full bg-neutral-50 hover:bg-neutral-100/50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-850 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all font-mono"
                        placeholder="08809f55"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-neutral-700 block">Derivation:</label>
                      <input
                        type="text"
                        value={xpubDerivation}
                        onChange={(e) => setXpubDerivation(e.target.value)}
                        className="w-full bg-neutral-50 hover:bg-neutral-100/50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-850 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all font-mono"
                        placeholder="m/52’/ 0’/12’/5’"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-neutral-750 block">xpub/zpub:</label>
                      <textarea
                        rows={3}
                        value={xpubValue}
                        onChange={(e) => setXpubValue(e.target.value)}
                        className="w-full bg-neutral-50 hover:bg-neutral-100/50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-neutral-850 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all select-all leading-relaxed resize-none"
                        placeholder="xpub6FPYM2UrngG1uBCyK9BM..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveKeystoreModal(null)}
                      className="flex-1 py-3 text-xs font-black border border-gray-300 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateActiveKeystore({
                          type: 'xpub',
                          fingerprint: xpubFingerprint || '08809f55',
                          keyData: `XPUB: ${xpubValue}`
                        });
                        setActiveKeystoreModal(null);
                        showToastAlert("✅ Extended Public Key (watch-only) guardados.");
                      }}
                      className="flex-1 py-3 text-xs font-black bg-neutral-950 text-white rounded-xl hover:bg-neutral-850 active:scale-95 transition-all text-center cursor-pointer shadow-md shadow-neutral-900/10"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
