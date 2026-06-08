import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  QrCode,
  Sliders,
  Sparkles,
  BookOpen,
  LogOut,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Smartphone,
  Copy,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Zap,
  HelpCircle,
  RefreshCw,
  Key,
  FileText,
  Eye,
  EyeOff,
  Download,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';
import { SidebarTab, Keystore, TimelockConfig, Transaction } from '../types';
import { SATS_TO_MXN_RATE, SATS_TO_USD_RATE, formatSats, formatMxn, formatUsd, glossaryData, defaultKeystores } from '../data';
import { HelpTooltip } from './HelpTooltip';

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

// Pre-curated high-fidelity interactive flashcards
const flashcards = [
  {
    concept: 'Autocustodia',
    tag: 'Soberanía y Seguridad',
    question: '¿Qué significa la autocustodia en el mundo Bitcoin?',
    answer: 'Significa ser el único dueño y responsable de resguardar tus llaves privadas. Al no depender de ningún banco o plataforma digital, garantizas que nadie pueda congelar, confiscar o restringir el uso de tus satoshis.'
  },
  {
    concept: 'Descriptor Criptográfico',
    tag: 'Receta de Respaldo',
    question: '¿Para qué sirve un "descriptor" en una wallet moderna?',
    answer: 'Es una receta técnica detallada que describe exactamente cómo se generan las direcciones. Funciona como un respaldo universal para recuperar y visualizar tu saldo y configuraciones en softwares externos como Sparrow.'
  },
  {
    concept: 'Bloqueos Temporales (Timelocks)',
    tag: 'Seguridad Multifactor',
    question: '¿Cómo funciona un "timelock" en caso de herencia o pérdida?',
    answer: 'Permite programar una regla de bloqueo temporal de fondos. Si tu llave principal permanece inactiva por el periodo definido, tus llaves secundarias de recuperación (ej. familiares) se activan automáticamente para rescatar los sats.'
  },
  {
    concept: 'Frase Semilla (Mnemónica)',
    tag: 'Clave Maestra',
    question: '¿Por qué debes guardar tu semilla físicamente offline y no digital?',
    answer: 'Cualquier archivo digital o foto en la nube es vulnerable a hackeos. Al escribir tu semilla físicamente, eliminas por completo los riesgos de hackeo digital remoto, protegiendo tus claves privadas al 100%.'
  },
  {
    concept: 'Firma Múltiple (Multisig)',
    tag: 'Seguridad Colectiva',
    question: '¿Cómo funciona una billetera multifirma (Quórum)?',
    answer: 'Requiere la aprobación de varias firmas independientes (ej. 2 de 3 llaves) para liberar fondos. Si un atacante compromete sólo una de tus llaves o dispositivos, tu balance sigue a salvo.'
  },
  {
    concept: 'Ark Link (Proximidad)',
    tag: 'Canal de Proximidad',
    question: '¿Por qué Ark Link acelera las transferencias diarias en Mérida?',
    answer: 'Permite realizar micropagos de satoshis de forma instantánea de celular a celular de forma off-chain. Evita la congestión de la red principal y las altas tarifas de minería, idóneo para el uso cotidiano.'
  }
];

interface RecoveryKeyItem {
  id: string;
  isOpen: boolean;
  type: 'Timelocker absoluto' | 'Timelocker relativo';
  availability: string; // e.g. "90 días, 11horas, 9 minutos"
  notifications: 'Sí' | 'No';
}

interface DashboardScreenProps {
  policyType: 'single' | 'multi';
  scriptType: string;
  descriptor: string;
  assignedKeystores: Keystore[];
  timelockConfig: TimelockConfig;
  onExit: () => void;
  onOpenTerm: (termId: string) => void;
  initialTab?: SidebarTab;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  policyType,
  scriptType,
  descriptor,
  assignedKeystores,
  timelockConfig,
  onExit,
  onOpenTerm,
  initialTab,
}) => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<SidebarTab>(initialTab || 'resumen');

  // Synchronize dynamic initialTab deep-linking
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Wallet funds state
  const [balance, setBalance] = useState<number>(97500);

  // State to toggle between MXN and USD estimated values
  const [currencyMode, setCurrencyMode] = useState<'MXN' | 'USD'>('MXN');

  // Local states to allow real-time editing of security metrics in settings
  const [localPolicyType, setLocalPolicyType] = useState<'single' | 'multi'>(policyType);
  const [localScriptType, setLocalScriptType] = useState<string>(scriptType);
  const [localMultisigThreshold, setLocalMultisigThreshold] = useState<string>(policyType === 'multi' ? '2 de 3' : '2 de 3');
  const [localKeystores, setLocalKeystores] = useState<Keystore[]>(assignedKeystores);
  const [localTimelock, setLocalTimelock] = useState<TimelockConfig>(timelockConfig);
  const [localDescriptor, setLocalDescriptor] = useState<string>(descriptor);
  const [activeEditKeystoreIdx, setActiveEditKeystoreIdx] = useState<number>(0);
  const [isKeystoreAccordionOpen, setIsKeystoreAccordionOpen] = useState<boolean>(true); // Start open for interactive feel
  const [isRecoveryAccordionOpen, setIsRecoveryAccordionOpen] = useState<boolean>(false);

  // Recovery Keys List state matching SetupScreen
  const [localRecoveryKeys, setLocalRecoveryKeys] = useState<RecoveryKeyItem[]>(() => {
    const keys: RecoveryKeyItem[] = [];
    if (timelockConfig.absoluteActive) {
      keys.push({
        id: 'rec-1',
        isOpen: true,
        type: 'Timelocker absoluto',
        availability: timelockConfig.absoluteValue || '2026-12-31',
        notifications: timelockConfig.allowNotifications ? 'Sí' : 'No'
      });
    }
    if (timelockConfig.relativeActive) {
      keys.push({
        id: keys.length === 0 ? 'rec-1' : 'rec-2',
        isOpen: keys.length === 0,
        type: 'Timelocker relativo',
        availability: `${timelockConfig.relativeValue || 90} días, 11horas, 9 minutos`,
        notifications: timelockConfig.allowNotifications ? 'Sí' : 'No'
      });
    }
    if (keys.length === 0) {
      keys.push({
        id: 'rec-1',
        isOpen: true,
        type: 'Timelocker absoluto',
        availability: '2026-12-31',
        notifications: 'Sí'
      });
      keys.push({
        id: 'rec-2',
        isOpen: false,
        type: 'Timelocker relativo',
        availability: '90 días, 11horas, 9 minutos',
        notifications: 'No'
      });
    }
    return keys;
  });

  const [recoveryKeysActivated, setRecoveryKeysActivated] = useState<boolean>(
    timelockConfig.absoluteActive || timelockConfig.relativeActive
  );

  const [activeCalendars, setActiveCalendars] = useState<Record<string, { month: number; year: number; isOpen: boolean }>>(() => {
    return {
      'rec-1': { month: 11, year: 2026, isOpen: false },
      'rec-2': { month: 11, year: 2026, isOpen: false }
    };
  });

  const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Interactive keystore modal states (mirroring SetupScreen)
  const [activeKeystoreModal, setActiveKeystoreModal] = useState<'private-key' | 'magic-word' | 'hot-key' | 'xpub' | null>(null);
  
  // Private Key passwords
  const [privKeyPassword, setPrivKeyPassword] = useState<string>('');
  const [privKeyConfirmPassword, setPrivKeyConfirmPassword] = useState<string>('');
  const [showPrivKeyPassword, setShowPrivKeyPassword] = useState<boolean>(false);
  const [showPrivKeyConfirmPassword, setShowPrivKeyConfirmPassword] = useState<boolean>(false);

  // Magic word states
  const [magicWordUses, setMagicWordUses] = useState<number>(5);
  const [magicWordText, setMagicWordText] = useState<string>('ROCA');

  // Hotwallet Key BIP39 generator states
  const [hotKeyWordCount, setHotKeyWordCount] = useState<number>(12);
  const [hotKeyWords, setHotKeyWords] = useState<string[]>([]);

  // Watch-only / XPUB states
  const [xpubDeviceType, setXpubDeviceType] = useState('Airgapped wallet(Coldcard)');
  const [xpubFingerprint, setXpubFingerprint] = useState('08809f55');
  const [xpubDerivation, setXpubDerivation] = useState("m/52’/ 0’/12’/5’");
  const [xpubValue, setXpubValue] = useState('xpub6FPYM2UrngG1uBCyK9BMivaTUrWp5sP3Bqkkr85LzZ4YxT3GqmPDb2jtgYosGtnpmeybtHYSZEEry4a5M8Sqw5uvagN3vvT905ShJUk2e24');

  // BIP39 Generator Helper
  const generateBip39Words = (count: number) => {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * BIP39_LIST.length);
      words.push(BIP39_LIST[idx]);
    }
    return words;
  };

  // Trigger Keystore Modal opening
  const handleOpenKeystoreModal = (type: 'private-key' | 'magic-word' | 'hot-key' | 'xpub') => {
    setActiveKeystoreModal(type);
    if (type === 'magic-word') {
      setMagicWordText('ROCA');
    } else if (type === 'hot-key') {
      setHotKeyWords(generateBip39Words(hotKeyWordCount));
    }
  };

  // Helper function to download file for Coldcard setup under watch-only configuration
  const handleDownloadColdkeyFile = () => {
    const fileContent = `Coldcard multisig setup file (created by Ataraxia)

Name: H2 Bitcoin 2026 Policy: 2 of 3 Derivation: ${xpubDerivation}
Format: P2WHS

${xpubFingerprint}: ${xpubValue}

Structure of the xpub: [Master fingerprint, Derivation Path, xpub/zpub]`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'H2COLDKEY25000.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setCopiedNotification("📥 Archivo H2COLDKEY25000.txt descargado con éxito.");
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  const updateActiveKeystore = (fields: Partial<Keystore>) => {
    setLocalKeystores(prev => {
      const copy = [...prev];
      if (copy[activeEditKeystoreIdx]) {
        copy[activeEditKeystoreIdx] = {
          ...copy[activeEditKeystoreIdx],
          ...fields
        };
      }
      regenerateLocalDescriptor(copy, localTimelock);
      return copy;
    });
  };

  // Real-time descriptor regenerator based on edited keystore names & footprints
  const regenerateLocalDescriptor = (
    updatedKeystores: Keystore[],
    updatedTimelock: TimelockConfig,
    policySelected?: 'single' | 'multi',
    scriptSelected?: string,
    thresholdSelected?: string
  ) => {
    const currentPolicy = policySelected !== undefined ? policySelected : localPolicyType;
    const currentScript = scriptSelected !== undefined ? scriptSelected : localScriptType;
    const currentThreshold = thresholdSelected !== undefined ? thresholdSelected : localMultisigThreshold;

    let baseStr = '';
    if (currentPolicy === 'single') {
      if (currentScript === 'Legacy (P2PKH)') {
        baseStr = 'pkh(Keystore1)';
      } else if (currentScript === 'Nested Segwit (P2SH-P2WPKH)') {
        baseStr = 'sh(wpkh(Keystore1))';
      } else {
        // Native Segwit (P2WPKH) - default
        baseStr = 'wpkh(keystore1)';
      }
    } else {
      const [mStr, nStr] = currentThreshold.split(' de ');
      const req = mStr || '2';
      const total = parseInt(nStr || '3', 10);
      const keyRefs = Array.from({ length: total }, (_, i) => `keystore${i + 1}`).join(', ');

      if (currentScript === 'Legacy (P2SH)') {
        baseStr = `sh(sortedmulti(${req}, ${keyRefs}))`;
      } else if (currentScript === 'Nested Segwit (P2SH-P2WSH)') {
        baseStr = `sh(wsh(sortedmulti(${req}, ${keyRefs})))`;
      } else {
        // Native Segwit (P2WSH) - default
        baseStr = `wsh(sortedmulti(${req}, ${keyRefs}))`;
      }
    }

    setLocalDescriptor(baseStr);
  };

  React.useEffect(() => {
    regenerateLocalDescriptor(assignedKeystores, timelockConfig, policyType, scriptType, policyType === 'multi' ? '2 de 3' : '2 de 3');
  }, [policyType, scriptType, assignedKeystores, timelockConfig]);

  const handlePolicyOrThresholdChange = (
    newPolicy: 'single' | 'multi',
    newThreshold: string,
    newScript?: string
  ) => {
    setLocalPolicyType(newPolicy);
    setLocalMultisigThreshold(newThreshold);

    let finalScript = newScript;
    if (!finalScript) {
      if (newPolicy === 'single') {
        finalScript = 'Native Segwit (P2WPKH)';
      } else {
        finalScript = 'Native Segwit (P2WSH)';
      }
    }
    setLocalScriptType(finalScript);

    // Adjust keystores list dynamically
    let updatedKeystores = [...localKeystores];
    if (newPolicy === 'single') {
      const first = updatedKeystores[0] || {
        id: 'ks-main-1',
        name: 'H2 Bitcoin 2026',
        type: 'private-key',
        fingerprint: 'A3F8E122',
        keyData: 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]',
      };
      updatedKeystores = [{ ...first, name: first.name === 'Key #1' ? 'H2 Bitcoin 2026' : first.name }];
      setActiveEditKeystoreIdx(0);
    } else {
      const [, totalStr] = newThreshold.split(' de ');
      const countNeeded = parseInt(totalStr || '3', 10);

      if (updatedKeystores.length < countNeeded) {
        for (let i = updatedKeystores.length; i < countNeeded; i++) {
          const defaultKey = defaultKeystores[i % defaultKeystores.length];
          updatedKeystores.push({
            id: `ks-multi-${Date.now()}-${i}`,
            name: `Key #${i + 1}`,
            type: defaultKey.type === 'private-key' ? 'xpub' : defaultKey.type,
            fingerprint: defaultKey.fingerprint,
            keyData: defaultKey.keyData,
            isCustom: true
          });
        }
      }
      updatedKeystores = updatedKeystores.slice(0, countNeeded).map((k, index) => {
        if (k.name.startsWith('Key #') || k.name === 'H2 Bitcoin 2026') {
          return { ...k, name: `Key #${index + 1}` };
        }
        return k;
      });

      if (activeEditKeystoreIdx >= countNeeded) {
        setActiveEditKeystoreIdx(0);
      }
    }

    setLocalKeystores(updatedKeystores);
    regenerateLocalDescriptor(updatedKeystores, localTimelock, newPolicy, finalScript, newThreshold);
  };

  const handleScriptChange = (newScript: string) => {
    setLocalScriptType(newScript);
    regenerateLocalDescriptor(localKeystores, localTimelock, localPolicyType, newScript, localMultisigThreshold);
  };

  const handleUpdateKeystore = (index: number, fields: Partial<Keystore>) => {
    setLocalKeystores(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = {
          ...copy[index],
          ...fields
        };
      }
      regenerateLocalDescriptor(copy, localTimelock, localPolicyType, localScriptType, localMultisigThreshold);
      return copy;
    });
  };

  const handleUpdateTimelock = (fields: Partial<TimelockConfig>) => {
    setLocalTimelock(prev => {
      const copy = { ...prev, ...fields };
      regenerateLocalDescriptor(localKeystores, copy, localPolicyType, localScriptType, localMultisigThreshold);
      return copy;
    });
  };

  const handlePrevMonth = (recId: string) => {
    setActiveCalendars(prev => {
      const current = prev[recId] || { month: 11, year: 2026, isOpen: true };
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
      const current = prev[recId] || { month: 11, year: 2026, isOpen: true };
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
    const current = activeCalendars[recId] || { month: 11, year: 2026, isOpen: true };
    const monthFormatted = String(current.month + 1).padStart(2, '0');
    const dayFormatted = String(dayNum).padStart(2, '0');
    const dateString = `${current.year}-${monthFormatted}-${dayFormatted}`;
    
    updateRecoveryKey(recId, { availability: dateString });
  };

  const handleSelectPresetDate = (recId: string, fullDate: string) => {
    const parts = fullDate.split('-');
    if (parts.length === 3) {
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10) - 1;
      setActiveCalendars(prev => {
        const current = prev[recId] || { month: 11, year: 2026, isOpen: true };
        return {
          ...prev,
          [recId]: { ...current, month: mo, year: yr }
        };
      });
    }
    updateRecoveryKey(recId, { availability: fullDate });
  };

  const renderCalendarDays = (recId: string, currentVal: string) => {
    const current = activeCalendars[recId] || { month: 11, year: 2026, isOpen: true };
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
    const firstDayIndex = new Date(current.year, current.month, 1).getDay();

    const dayCells: React.ReactNode[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(<div key={`empty-${recId}-${i}`} className="h-7 w-7" />);
    }

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

  const toggleRecoveryCollapse = (id: string) => {
    setLocalRecoveryKeys(prev =>
      prev.map(item => (item.id === id ? { ...item, isOpen: !item.isOpen } : item))
    );
  };

  const updateRecoveryKey = (id: string, fields: Partial<RecoveryKeyItem>) => {
    setLocalRecoveryKeys(prev => {
      const updated = prev.map(item => (item.id === id ? { ...item, ...fields } : item));
      
      const hasAbsolute = updated.some(r => r.type === 'Timelocker absoluto');
      const hasRelative = updated.some(r => r.type === 'Timelocker relativo');
      const firstAbsolute = updated.find(r => r.type === 'Timelocker absoluto');
      const firstRelative = updated.find(r => r.type === 'Timelocker relativo');
      const firstNotif = updated.some(r => r.notifications === 'Sí');

      // extract numeric part safely from relative string/value if needed
      let relValNum = 90;
      if (firstRelative) {
        const matches = firstRelative.availability.match(/\d+/);
        if (matches) {
          relValNum = parseInt(matches[0], 10);
        }
      }

      handleUpdateTimelock({
        absoluteActive: hasAbsolute,
        absoluteValue: firstAbsolute?.availability || '2026-12-31',
        relativeActive: hasRelative,
        relativeValue: relValNum,
        allowNotifications: firstNotif
      });

      return updated;
    });
  };

  const handleAddRecoveryKey = () => {
    const nextNum = localRecoveryKeys.length + 1;
    const newId = `rec-${Date.now()}-${nextNum}`;
    setLocalRecoveryKeys(prev => [
      ...prev,
      {
        id: newId,
        isOpen: true,
        type: 'Timelocker absoluto',
        availability: '2026-12-31',
        notifications: 'Sí'
      }
    ]);
  };

  const handleRemoveRecoveryKey = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (localRecoveryKeys.length <= 1) {
      return;
    }
    setLocalRecoveryKeys(prev => {
      const filtered = prev.filter(item => item.id !== id);
      
      const hasAbsolute = filtered.some(r => r.type === 'Timelocker absoluto');
      const hasRelative = filtered.some(r => r.type === 'Timelocker relativo');
      const firstAbsolute = filtered.find(r => r.type === 'Timelocker absoluto');
      const firstRelative = filtered.find(r => r.type === 'Timelocker relativo');
      const firstNotif = filtered.some(r => r.notifications === 'Sí');

      let relValNum = 90;
      if (firstRelative) {
        const matches = firstRelative.availability.match(/\d+/);
        if (matches) {
          relValNum = parseInt(matches[0], 10);
        }
      }

      handleUpdateTimelock({
        absoluteActive: hasAbsolute,
        absoluteValue: firstAbsolute?.availability || '2026-12-31',
        relativeActive: hasRelative,
        relativeValue: relValNum,
        allowNotifications: firstNotif
      });

      return filtered;
    });
  };

  // Dynamic dynamic list of transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      type: 'entrada',
      sender: 'bc1q9p3a4u7e8y...r5k',
      recipient: 'bc1qp2wsegwit...89a',
      amountSats: 50000,
      amountMxn: 50000 * SATS_TO_MXN_RATE,
      date: '2026-06-05',
      time: '14:23',
      confirmations: 144,
      txid: 'f83e20e8b2a59a721dcac19a842cfb2a0956b9c9735d4f3b7914838634bf1b51',
    },
    {
      id: 'tx-2',
      type: 'entrada',
      sender: 'bc1q6t0g7j8m9s...2xz',
      recipient: 'bc1qp2wsegwit...89a',
      amountSats: 47500,
      amountMxn: 47500 * SATS_TO_MXN_RATE,
      date: '2026-06-06',
      time: '09:12',
      confirmations: 42,
      txid: '8a2b53f7c46924d5e9b31d4e56c1a82f0c7639d67b2be48fca8a4b6932cd711e',
    },
    {
      id: 'tx-3',
      type: 'salida',
      sender: 'bc1qp2wsegwit...89a',
      recipient: 'bc1qy8h7d3a2j...5pt',
      amountSats: -15000,
      amountMxn: -15000 * SATS_TO_MXN_RATE,
      date: '2026-06-06',
      time: '18:45',
      confirmations: 12,
      txid: '3c19b846e492f58a7e32d169ac812c7590d3bb63929efcca16278db7304bf9e8',
    },
    {
      id: 'tx-4',
      type: 'entrada',
      sender: 'bc1qk7p5m2u8x...d8s',
      recipient: 'bc1qp2wsegwit...89a',
      amountSats: 15000,
      amountMxn: 15000 * SATS_TO_MXN_RATE,
      date: '2026-06-07',
      time: '00:15',
      confirmations: 2,
      txid: '298e847c2d159a60e9d3c5bf4f2ea09c058ab39c0d2eb6ef3b723528fa48cdbe',
    }
  ]);

  // Form states for manual send
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmountSats, setSendAmountSats] = useState<string>('15000');
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Form states for receiving simulator
  const [simulatedFaucetLoading, setSimulatedFaucetLoading] = useState(false);

  // Alert/Notification State
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Search filter for Glossary
  const [glossaryFilter, setGlossaryFilter] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('all');

  // Flashcards interactive states
  const [fundamentosSubTab, setFundamentosSubTab] = useState<'glosario' | 'flashcards'>('glosario');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);

  // Ark Link Interactive Simulation State Flow
  // Steps: 'idle', 'amount', 'qr', 'scanning', 'completed'
  const [arkStep, setArkStep] = useState<'idle' | 'amount' | 'qr' | 'scanning' | 'completed'>('idle');
  const [arkAmount, setArkAmount] = useState<number>(50000);
  const [arkScanTimer, setArkScanTimer] = useState<number>(3);
  const [arkError, setArkError] = useState<string | null>(null);

  // Tooltip helper
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  // Execute manual simulated sending
  const handleSendSats = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(sendAmountSats, 10);
    if (!amount || amount <= 0) return;
    if (amount > balance) {
      alert('Saldo insuficiente en sats para realizar la transacción.');
      return;
    }

    const txIdStr = Math.floor(Math.random() * 0xFFFFFFFFFFFFFFFF).toString(16).toLowerCase().padStart(64, '0');
    const newTx: Transaction = {
      id: `manual-tx-${Date.now()}`,
      type: 'salida',
      sender: 'bc1qp2wsegwit...89a',
      recipient: sendAddress || 'bc1qrecipient_address_mexico_5s',
      amountSats: -amount,
      amountMxn: -amount * SATS_TO_MXN_RATE,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      confirmations: 0,
      txid: txIdStr
    };

    setBalance(prev => prev - amount);
    setTransactions(prev => [newTx, ...prev]);
    setSendSuccessMessage(`¡Transacción de ${formatSats(amount)} sats enviada con éxito!`);
    setSendAddress('');
    setTimeout(() => setSendSuccessMessage(null), 4000);
  };

  // Simulate incoming sats
  const handleSimulateReceive = () => {
    setSimulatedFaucetLoading(true);
    setTimeout(() => {
      const receiveAmt = 12500;
      const txIdStr = Math.floor(Math.random() * 0xFFFFFFFFFFFFFFFF).toString(16).toLowerCase().padStart(64, '0');
      const newTx: Transaction = {
        id: `faucet-tx-${Date.now()}`,
        type: 'entrada',
        sender: 'bc1qfaucet_ataraxia_sender_99',
        recipient: 'bc1qp2wsegwit...89a',
        amountSats: receiveAmt,
        amountMxn: receiveAmt * SATS_TO_MXN_RATE,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        confirmations: 1,
        txid: txIdStr
      };

      setBalance(prev => prev + receiveAmt);
      setTransactions(prev => [newTx, ...prev]);
      setSimulatedFaucetLoading(false);
      triggerCopy(`Se recibieron +${formatSats(receiveAmt)} sats de prueba.`, 'faucet');
    }, 1200);
  };

  // Start the Ark Link interactive transmission
  const startArkSimulation = () => {
    if (arkAmount > balance) {
      setArkError('El saldo de tu billetera es inferior a los sats que deseas enviar en el Ark Link.');
      return;
    }
    setArkError(null);
    setArkStep('qr');
  };

  // Simulate scanning of Ark Link
  const triggerScanningSimulation = () => {
    setArkStep('scanning');
    let timeLeft = 3;
    setArkScanTimer(3);
    const interval = setInterval(() => {
      timeLeft--;
      setArkScanTimer(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        
        // Push transaction success
        const txIdStr = Math.floor(Math.random() * 0xFFFFFFFFFFFFFFFF).toString(16).toLowerCase().padStart(64, '0');
        const newTx: Transaction = {
          id: `ark-tx-${Date.now()}`,
          type: 'salida',
          sender: 'bc1qp2wsegwit...89a',
          recipient: 'Ark Proximity Pool Line A',
          amountSats: -arkAmount,
          amountMxn: -arkAmount * SATS_TO_MXN_RATE,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          confirmations: 1,
          txid: txIdStr,
          isArk: true
        };

        setBalance(prev => prev - arkAmount);
        setTransactions(prev => [newTx, ...prev]);
        setArkStep('completed');
      }
    }, 800);
  };

  // Sub-renderer for sidebar navigation item
  const SidebarItem = ({ tab, label, icon: Icon, colorClass = '' }: { tab: SidebarTab; label: string; icon: any; colorClass?: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        // Reset Ark step on navigation to keep UX clean
        if (tab !== 'ark-link') setArkStep('idle');
      }}
      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all font-sans cursor-pointer ${
        activeTab === tab
          ? 'bg-gradient-to-r from-red-50 to-pink-50/10 text-[#E60023] font-extrabold border border-red-100 shadow-sm'
          : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/80'
      } ${colorClass}`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={18} className={activeTab === tab ? 'text-[#E60023] animate-pulse' : 'text-neutral-400'} />
        <span className="text-xs md:text-sm">{label}</span>
      </div>
      {tab === 'ark-link' && (
        <span className="text-[9px] bg-red-100 border border-red-200 font-extrabold text-[#E60023] px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
          Estrella
        </span>
      )}
    </button>
  );

  return (
    <div id="dashboard-layout" className="min-h-screen bg-[#F5F5F5] text-neutral-800 font-sans flex flex-col md:flex-row relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-white border border-[#B7A6FF]/30 text-neutral-900 font-bold rounded-2xl shadow-xl flex items-center gap-2 text-xs border-l-4 border-l-[#B7A6FF]"
          >
            <CheckCircle size={16} className="text-[#B7A6FF]" />
            <span>{copiedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR RAIL --- */}
      <div className="w-full md:w-64 bg-white md:shrink-0 p-5 flex flex-col justify-between border-r border-gray-200 md:sticky md:top-0 md:h-screen shadow-sm">
        
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-[#E60023] flex items-center justify-center font-bold font-display shadow-lg">
              <span className="text-white italic text-xl font-black">A</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-sm tracking-tight text-[#E60023] block">ATARAXIA</span>
              <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Soberana Activa
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="space-y-1">
            <SidebarItem tab="resumen" label="Resumen" icon={Wallet} />
            <SidebarItem tab="transacciones" label="Transacciones" icon={ArrowUpRight} />
            <SidebarItem tab="enviar" label="Enviar SATS" icon={ArrowUpRight} />
            <SidebarItem tab="recibir" label="Recibir SATS" icon={ArrowDownLeft} />
            <SidebarItem tab="historial" label="Historial" icon={History} colorClass="border-l-2 border-[#B7A6FF]" />
            <SidebarItem tab="ark-link" label="Ark Link" icon={QrCode} />
            <SidebarItem tab="configuracion" label="Configuración" icon={Sliders} />
            <SidebarItem tab="fundamentos" label="Repasar Fundamentos" icon={BookOpen} colorClass="mt-4 pt-4 border-t border-gray-200" />
          </div>
        </div>

        {/* Exit back to Home */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onExit}
            className="w-full p-2.5 bg-neutral-50 hover:bg-red-50 hover:text-[#E60023] border border-gray-200 rounded-lg text-xs font-semibold text-neutral-500 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Salir de la Cuenta
          </button>
        </div>

      </div>

      {/* --- MAIN PANEL AREA --- */}
      <div id="content-panel" className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* UPPER STATUS STRIP */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-5 border-b border-gray-200">
          <div>
            <span className="text-xs text-neutral-400 font-mono font-bold">BILLETERA DE PRUEBAS • MERIDA DEPOSITS</span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-black font-display text-neutral-900">
                Billetera {policyType === 'single' ? 'Single Signature' : 'Multi Signature'}
              </h2>
              <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold border border-[#B7A6FF]/20">
                {scriptType.split(' ')[0]}
              </span>
            </div>
          </div>


        </div>

        {/* Dynamic Inner Tab Content Renderers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >

            {/* ============== RESUMEN TAB ============== */}
            {activeTab === 'resumen' && (
              <div id="tab-resumen" className="space-y-6">
                
                {/* Balance Cards Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total sats */}
                  <div className="p-6 bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-[24px] relative overflow-hidden shadow-sm">
                    <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-brand-red/10 blur-xl pointer-events-none" />
                    <span className="text-xs text-neutral-500 font-bold tracking-wider block mb-1">Balance total en Sats</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-extrabold text-neutral-900 font-display tracking-tight">
                        {formatSats(balance)}
                      </span>
                      <span className="text-sm font-mono text-[#E60023] font-black">sats</span>
                    </div>
                    <div className="mt-3 text-[11px] text-[#E60023] flex items-center gap-1.5 font-sans font-semibold">
                      <TrendingUp size={14} />
                      <span>El saldo está asegurado bajo tu custodia mexicana.</span>
                    </div>
                  </div>

                  {/* Calculated MXN/USD value */}
                  <div className="p-6 bg-white border border-gray-205 rounded-[24px] shadow-sm flex items-start justify-between relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-xs text-neutral-500 font-bold tracking-wider block mb-1">
                        {currencyMode === 'MXN' ? 'Valor estimado en pesos' : 'Valor estimado en dólares'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-[#E60023] font-display tracking-tight">
                          {currencyMode === 'MXN'
                            ? formatMxn(balance * SATS_TO_MXN_RATE).replace('$', '$ ')
                            : formatUsd(balance * SATS_TO_USD_RATE).replace('$', '$ ')}
                        </span>
                        <span className="text-xs font-semibold text-neutral-400">
                          {currencyMode === 'MXN' ? 'MXN' : 'USD'}
                        </span>
                      </div>
                      <span className="block text-[11px] text-neutral-400 font-mono pt-2 font-semibold">
                        {currencyMode === 'MXN'
                          ? 'Calculado a $14,226 MXN por millón de sats'
                          : 'Calculado a $815 USD por millón de sats'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrencyMode(prev => prev === 'MXN' ? 'USD' : 'MXN')}
                      className="bg-neutral-50 hover:bg-neutral-100 active:scale-95 text-neutral-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl border border-gray-300 shadow-sm flex items-center gap-1 cursor-pointer transition-all self-start ml-2 uppercase"
                      title="Cambiar divisa"
                    >
                      <span>🔄</span>
                      <span>{currencyMode === 'MXN' ? 'USD' : 'MXN'}</span>
                    </button>
                  </div>

                  {/* Quorum / Lock State status */}
                  <div className="p-6 bg-white border border-gray-205 rounded-[24px] shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-neutral-500 block mb-1 font-bold">Respaldo Automático Temporal</span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
                        {localTimelock.absoluteActive ? (
                          <>
                            <Calendar size={16} className="text-[#B7A6FF]" />
                            <span>Seguro hasta {localTimelock.absoluteValue}</span>
                          </>
                        ) : localTimelock.relativeActive ? (
                          <>
                            <Clock size={16} className="text-yellow-600" />
                            <span>Seguro por {localTimelock.relativeValue} días inactivos</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} className="text-emerald-600 animate-bounce" />
                            <span>Custodias Standard Activas</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Notificaciones preventivas</span>
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        {localTimelock.allowNotifications ? 'Simulador SMS habilitado' : 'Notificación desconectada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Growth SVG Chart Section */}
                <div className="p-6 bg-white border border-gray-205 rounded-[24px] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Crecimiento Mensual Estimado de Sats</h3>
                      <p className="text-xs text-gray-500">Simulación del balance acumulado</p>
                    </div>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 font-bold">6 meses evaluados</span>
                  </div>

                  {/* HTML Area with beautiful visual SVG Chart */}
                  <div className="w-full h-48 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E60023" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#E60023" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,25 Q 20,20 40,24 T 80,10 T 100,6 L 100,30 L 0,30 Z"
                        fill="url(#chartGlow)"
                      />
                      <path
                        d="M 0,25 Q 20,20 40,24 T 80,10 T 100,6"
                        fill="none"
                        stroke="#E60023"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="6" r="1.5" fill="#FFD600" className="animate-ping" />
                      <circle cx="100" cy="6" r="1" fill="#E60023" />
                      <circle cx="40" cy="24" r="0.8" fill="#E60023" />
                      <circle cx="80" cy="10" r="0.8" fill="#E60023" />
                    </svg>

                    <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-neutral-400 px-1 font-mono pt-2 font-bold">
                      <span>Enero</span>
                      <span>Marzo</span>
                      <span>Mayo</span>
                      <span>Junio (Actual)</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activities Section */}
                <div className="p-6 bg-white border border-gray-205 rounded-[24px] shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-150">
                    <h3 className="text-sm font-extrabold text-neutral-800">Actividad Reciente</h3>
                    <button onClick={() => setActiveTab('transacciones')} className="text-xs text-[#B7A6FF] font-bold hover:text-purple-700 hover:underline flex items-center gap-1">
                      Ver todas las transacciones <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="divide-y divide-gray-150">
                    {transactions.slice(0, 3).map(tx => (
                      <div key={tx.id} className="py-3 flex items-center justify-between text-xs hover:bg-neutral-50/80 rounded-lg px-2 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#E60023]'}`}>
                            {tx.type === 'entrada' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <span className="font-extrabold text-neutral-850 block">
                              {tx.isArk ? 'Transferencia Proximidad Ark' : tx.type === 'entrada' ? 'Recibido de Red (Sats)' : 'Enviado Sats'}
                            </span>
                            <span className="text-[10px] text-neutral-400 block mt-0.5 font-semibold">{tx.date} a las {tx.time}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`font-black font-mono text-sm block ${tx.type === 'entrada' ? 'text-emerald-600' : 'text-[#E60023]'}`}>
                            {tx.type === 'entrada' ? '+' : ''}{formatSats(tx.amountSats)}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-semibold font-mono block">
                            {formatMxn(Math.abs(tx.amountSats * SATS_TO_MXN_RATE))} MXN
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ============== TRANSACCIONES TAB ============== */}
            {activeTab === 'transacciones' && (
              <div id="tab-transacciones" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900">Transacciones Realizadas</h3>
                    <p className="text-xs text-neutral-500">Historial de depósitos y cobros simulados en la billetera</p>
                  </div>

                  {/* Simulate receive faucet */}
                  <button
                    onClick={handleSimulateReceive}
                    disabled={simulatedFaucetLoading}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <ArrowDownLeft size={14} />
                    {simulatedFaucetLoading ? 'Espere...' : 'Simular Cobro (+12,500 sats)'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="p-5 bg-white border border-gray-205 rounded-[24px] hover:border-gray-300 transition-colors shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${tx.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#E60023]'}`}>
                            {tx.type === 'entrada' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <span className="font-extrabold text-neutral-850 text-sm block">
                              {tx.isArk ? 'Transferencia Instantánea Ark Link' : tx.type === 'entrada' ? 'Fondeo de Satoshi Recibido' : 'Egreso de Billetera'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono font-semibold">TxID: {tx.txid.slice(0, 8)}...{tx.txid.slice(-8)}</span>
                          </div>
                        </div>

                        <div className="md:text-right">
                          <span className={`text-base font-black font-mono ${tx.type === 'entrada' ? 'text-emerald-700' : 'text-[#E60023]'}`}>
                            {tx.type === 'entrada' ? '+' : ''}{formatSats(tx.amountSats)} sats
                          </span>
                          <span className="block text-xs text-neutral-400 font-semibold">{formatMxn(tx.amountSats * SATS_TO_MXN_RATE)} MXN</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-150 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-neutral-400 font-mono font-bold">
                        <div>
                          <span className="text-[10px] text-neutral-400 block leading-none font-semibold mb-0.5">Fecha y hora</span>
                          <span className="text-neutral-700">{tx.date} {tx.time}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block leading-none font-semibold mb-0.5">Confirmaciones</span>
                          <span className={tx.confirmations >= 6 ? 'text-emerald-600 font-black' : 'text-amber-500 animate-pulse'}>
                            {tx.confirmations} confs
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-neutral-400 block leading-none font-semibold mb-0.5">Destinatario</span>
                          <span className="text-neutral-700 block truncate font-sans font-semibold">{tx.recipient}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============== ENVIAR TAB ============== */}
            {activeTab === 'enviar' && (
              <div id="tab-enviar" className="max-w-xl mx-auto p-8 bg-white border border-gray-205 rounded-[24px] relative shadow-sm">
                <h3 className="text-lg font-extrabold text-neutral-900 mb-1.5 flex items-center gap-2">
                  <ArrowUpRight className="text-[#E60023]" size={20} />
                  Enviar Bitcoin sats
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Simula un egreso de fondos a cualquier dirección Bitcoin de forma guiada y visual. No requiere conexión activa.
                </p>

                {sendSuccessMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-emerald-700 text-xs rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>{sendSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSendSats} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block text-neutral-600 mb-1.5 font-bold">Dirección Bitcoin destino</label>
                    <input
                      type="text"
                      required
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                      placeholder="bc1q9p3a4u7e8y..."
                      className="w-full bg-white border border-gray-305 p-3.5 rounded-xl focus:border-[#E60025] hover:border-gray-400 text-neutral-850 font-mono focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-400 block mt-1 font-semibold">Dirección bitcoin simulada (bc1q format)</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-neutral-600 font-bold">Cantidad de Satoshis (Sats)</label>
                      <span className="font-mono text-neutral-400 font-semibold">Disponible: {formatSats(balance)} sats</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        required
                        value={sendAmountSats}
                        onChange={(e) => setSendAmountSats(e.target.value)}
                        className="w-full bg-white border border-gray-305 p-3.5 rounded-xl focus:border-[#E60025] text-neutral-850 font-mono font-bold focus:outline-none"
                      />
                      <span className="text-sm font-extrabold text-neutral-850">SATS</span>
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-purple-700 font-bold">
                      <span>Equivalente: {formatMxn(parseInt(sendAmountSats || '0', 10) * SATS_TO_MXN_RATE)} MXN</span>
                      <button
                        type="button"
                        onClick={() => setSendAmountSats(String(Math.floor(balance * 0.95)))}
                        className="underline text-[10px] hover:text-[#E60023] text-[#B7A6FF] font-black"
                      >
                        Enviar Todo (dejar margen fee)
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-[#E60023] hover:bg-[#E60023]/90 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowUpRight size={16} />
                      Transmitir Transacción de Prueba
                    </motion.button>
                  </div>
                </form>
              </div>
            )}

            {/* ============== RECIBIR TAB ============== */}
            {activeTab === 'recibir' && (
              <div id="tab-recibir" className="max-w-xl mx-auto p-8 bg-white border border-gray-205 rounded-[24px] text-center shadow-sm">
                <h3 className="text-lg font-extrabold text-neutral-900 mb-2 flex items-center justify-center gap-2">
                  <ArrowDownLeft className="text-emerald-600 animate-bounce" size={20} />
                  Recibir Satoshis en Mérida
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Cualquier persona puede depositarte directo a esta dirección creada con tus llaves y tu <HelpTooltip termId="descriptor" onOpenTerm={onOpenTerm}>descriptor</HelpTooltip>.
                </p>

                {/* Animated QR simulation code */}
                <div className="relative mx-auto my-6 w-48 h-48 bg-white p-4 rounded-3xl flex flex-col items-center justify-center shadow-md overflow-hidden border-4 border-[#B7A6FF]/60">
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-95 p-1">
                    {/* Simulated visual QR structure patterns */}
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-transparent" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-transparent" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-transparent" />
                    <div className="bg-transparent" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-transparent" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-transparent" />
                    <div className="bg-transparent" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-transparent" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                    <div className="bg-neutral-900 rounded-[2px]" />
                  </div>
                  
                  {/* Decorative Bitcoin icon at center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-amber-50 text-amber-700 font-black flex items-center justify-center rounded-full border border-amber-200 shadow-sm text-base">
                    ₿
                  </div>

                  {/* Pulsing overlay line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#E60023] animate-bounce" />
                </div>

                {/* Address block */}
                <div className="p-3.5 bg-neutral-50 border border-gray-205 rounded-xl flex items-center justify-between text-left mb-6 max-w-sm mx-auto shadow-inner">
                  <div className="truncate font-mono text-xs text-neutral-750 font-bold pr-3" title="xpub6FPYM2UrngG1uBCyK9BMivaTUrWp5sP3Bqkkr85LzZ4YxT3GqmPDb2jtgYosGtnpmeybtHYSZEEry4a5M8Sqw5uvagN3vvT905ShJUk2e24">
                    xpub6FPYM2UrngG1uBCyK9BMivaTUrWp5sP3Bqkkr85LzZ4YxT3GqmPDb2jtgYosGtnpmeybtHYSZEEry4a5M8Sqw5uvagN3vvT905ShJUk2e24
                  </div>
                  <button
                    onClick={() => triggerCopy('xpub6FPYM2UrngG1uBCyK9BMivaTUrWp5sP3Bqkkr85LzZ4YxT3GqmPDb2jtgYosGtnpmeybtHYSZEEry4a5M8Sqw5uvagN3vvT905ShJUk2e24', 'xpub de cuenta copiado')}
                    className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 shrink-0 transition-colors"
                    title="Copiar xpub"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSimulateReceive}
                    disabled={simulatedFaucetLoading}
                    className="px-6 py-2.5 bg-[#B7A6FF] text-white font-black text-xs rounded-xl shadow-md tracking-wider uppercase hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    {simulatedFaucetLoading ? 'Fondeando Wallet...' : 'Simular Fondeo Externo (+12,500 sats)'}
                  </button>

                  <p className="text-[10px] text-neutral-400 font-semibold">
                    Esta acción simula un depósito externo de satoshis listo para corroborar en Mérida.
                  </p>
                </div>
              </div>
            )}

            {/* ============== HISTORIAL TAB ============== */}
            {activeTab === 'historial' && (
              <div id="tab-historial" className="space-y-6">
                <div className="p-5 bg-purple-50 border border-[#B7A6FF]/35 rounded-[20px] flex items-start gap-3">
                  <div className="p-2.5 bg-[#B7A6FF]/25 text-purple-700 rounded-xl shrink-0">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">Historial Estilo Explorador Financiero</h3>
                    <p className="text-xs text-purple-700 leading-normal mt-0.5">
                      Visualiza todos los flujos de entrada, salidas, marcas de tiempo y el nivel de confirmaciones de tu billetera con el color de marca Ataraxia Morado Historial.
                    </p>
                  </div>
                </div>

                {/* Explorer Table */}
                <div className="overflow-x-auto border border-gray-205 bg-white rounded-[20px] shadow-sm">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 uppercase text-[10px] border-b border-gray-150 font-bold">
                        <th className="p-4">Tipo</th>
                        <th className="p-4">Fecha y Hora</th>
                        <th className="p-4">TxID</th>
                        <th className="p-4 text-center">Confirmaciones</th>
                        <th className="p-4 text-right">Cantidad de sats</th>
                        <th className="p-4 text-right">Monto MXN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-purple-50/10 transition-colors">
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-sans text-[10px] font-bold uppercase tracking-wider ${
                              tx.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#E60023]'
                            }`}>
                              {tx.type === 'entrada' ? 'Entrada' : 'Salida'}
                            </span>
                          </td>
                          <td className="p-4 text-neutral-800">{tx.date} • {tx.time}</td>
                          <td className="p-4 text-neutral-500 truncate max-w-xs font-semibold" title={tx.txid}>
                            {tx.txid.slice(0, 12)}...
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                              tx.confirmations >= 6
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                            }`}>
                              {tx.confirmations} Confs
                            </span>
                          </td>
                          <td className="p-4 text-right font-black text-neutral-800">
                            {tx.type === 'entrada' ? '+' : ''}{formatSats(tx.amountSats)}
                          </td>
                          <td className="p-4 text-right text-neutral-500 font-semibold">
                            {formatMxn(tx.amountSats * SATS_TO_MXN_RATE)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============== ARK LINK TAB (STAR INTERACTIVE) ============== */}
            {activeTab === 'ark-link' && (
              <div id="tab-ark-link" className="max-w-2xl mx-auto p-8 bg-white border border-gray-205 rounded-[24px] relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 blur-2xl pointer-events-none" />
                
                {/* Header title */}
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-150">
                  <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 animate-spin-slow">
                    <QrCode size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-1.5">
                      Ark Link
                      <span className="text-[9px] bg-amber-100 border border-amber-305 font-black text-amber-800 px-1.5 py-0.5 rounded">FEATURE ESTRELLA</span>
                    </h3>
                    <p className="text-xs text-neutral-500">Simulación de transferencias de Bitcoin inmediatas de proximidad off-chain.</p>
                  </div>
                </div>

                {/* Subtitle / Explainer */}
                <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
                  Con **Ark Link**, enviarás satoshis instantáneamente sin depender de la congestión de la mempool de Bitcoin, ideal para compras rápidas en Mérida. Pruébalo ahora de forma guiada:
                </p>

                {/* ERROR FEEDBACK */}
                {arkError && (
                  <div className="p-3 mb-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl text-xs font-semibold">
                    {arkError}
                  </div>
                )}

                {/* FLOW MANAGER RENDERER */}
                
                {/* STEP 1: Idle (Configure transfer details) */}
                {arkStep === 'idle' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="p-4 bg-neutral-50 border border-gray-150 rounded-2xl space-y-3">
                      <span className="text-neutral-800 font-extrabold block text-sm">Paso 1: Configurar Envío</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="p-3 bg-amber-50 border border-amber-305 text-amber-800 text-xs font-extrabold rounded-xl text-center"
                        >
                          Enviar SATS
                        </button>
                        <button
                          type="button"
                          disabled
                          className="p-3 bg-neutral-100 border border-neutral-200 text-neutral-400 text-xs font-semibold rounded-xl text-center cursor-not-allowed"
                          title="Recibir deshabilitado para esta demo"
                        >
                          Recibir SATS (Demo)
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs text-neutral-600 font-bold">
                          <span>Ingresa el monto a transferir</span>
                          <span>Saldo actual: {formatSats(balance)} sats</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={arkAmount}
                            onChange={(e) => setArkAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                            className="bg-white border border-gray-305 p-3 rounded-lg text-neutral-800 font-mono font-bold text-sm w-full focus:outline-none focus:border-amber-400"
                          />
                          <span className="font-mono text-sm font-bold text-neutral-800">sats</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-purple-750 font-bold">
                          <span>Equivalente aproximado: {formatMxn(arkAmount * SATS_TO_MXN_RATE)} MXN</span>
                          <span className="text-neutral-400 font-bold">Tarifa de red sugerida: 0 sats</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={startArkSimulation}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 font-black text-neutral-900 text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap size={16} />
                      Generar Ark Link
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: QR Generated with animations */}
                {arkStep === 'qr' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                    <div className="p-2 border border-amber-200 bg-amber-50 rounded-xl block text-xs text-amber-800 max-w-sm mx-auto font-bold">
                      ¡Tu Ark Link de {formatSats(arkAmount)} sats está listo!
                    </div>

                    {/* QR and radar */}
                    <div className="relative mx-auto w-52 h-52 bg-white p-4 rounded-3xl flex flex-col items-center justify-center shadow-md overflow-hidden border-4 border-amber-300">
                      <div className="grid grid-cols-6 gap-2 w-full h-full opacity-90 p-1">
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-transparent" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-transparent" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-transparent" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-transparent" />
                        <div className="bg-transparent" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-transparent" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-transparent" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-transparent" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                        <div className="bg-neutral-950 rounded" />
                      </div>
                      
                      {/* Interactive visual symbol */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center rounded-full border border-amber-300 shadow-md text-lg animate-pulse">
                        ⚡
                      </div>

                      {/* Moving Scanner Laser Bar */}
                      <div className="absolute left-0 right-0 h-1 bg-amber-400 shadow-md shadow-amber-400 top-0 animate-[bounce_2.5s_infinite]" />
                    </div>

                    <div className="space-y-2 max-w-sm mx-auto">
                      <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                        Pídele a tu receptor que abra su aplicación Ataraxia o lector QR para simular el escaneo de proximidad.
                      </p>

                      <div className="flex gap-2 justify-center pt-2">
                        <button
                          onClick={triggerScanningSimulation}
                          className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-neutral-905 text-xs font-black rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all flex items-center gap-1"
                        >
                          <Smartphone size={14} />
                          Simular Escaneo del Receptor
                        </button>
                        <button
                          onClick={() => setArkStep('idle')}
                          className="px-3 py-2 bg-neutral-100 border border-gray-205 text-neutral-600 text-xs font-bold rounded-xl hover:bg-neutral-150"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Scanning simulation progress */}
                {arkStep === 'scanning' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-t-amber-500 border-neutral-200 animate-spin mx-auto mb-2" />
                    
                    <h4 className="text-sm font-extrabold text-neutral-900">Transmitiendo sats de proximidad...</h4>
                    <p className="text-xs text-neutral-500 font-semibold">Resolviendo contrato inteligente Miniscript off-chain</p>
                    
                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 font-mono text-xs rounded-full font-bold border border-amber-100 shadow-sm">
                      Espera {arkScanTimer}s... No cierres esta pantalla
                    </span>
                  </motion.div>
                )}

                {/* STEP 4: Transfer Completed screen */}
                {arkStep === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle size={32} />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-neutral-900">Transferencia Completada</h4>
                      <p className="text-2xl font-black text-emerald-600 font-mono">+{formatSats(arkAmount)} SATS</p>
                      <p className="text-xs text-neutral-500 font-semibold">Monto deducido a cuenta secundaria para receptor</p>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-gray-150 rounded-xl text-left max-w-sm mx-auto text-[11px] space-y-1.5 leading-normal font-mono font-bold text-neutral-800 shadow-inner">
                      <div className="flex justify-between">
                        <span className="text-neutral-400 font-semibold">ID de Transacción:</span>
                        <span className="text-neutral-800">ark-tx-{Date.now().toString().slice(-6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400 font-semibold">Nuevo saldo:</span>
                        <span className="text-amber-800 font-black">{formatSats(balance)} sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400 font-semibold">Estado de Red:</span>
                        <span className="text-emerald-600">Verificado Instantáneamente</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setArkStep('idle');
                      }}
                      className="px-6 py-2 bg-neutral-100 border border-gray-205 hover:bg-neutral-200 text-neutral-700 font-extrabold text-xs rounded-xl transition-colors"
                    >
                      Realizar Otra Transferencia
                    </button>
                  </motion.div>
                )}

              </div>
            )}

            {/* ============== CONFIGURACIÓN TAB ============== */}
            {activeTab === 'configuracion' && (
              <div id="tab-configuracion" className="space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900">Detalles Técnicos y Descriptor</h3>
                  <p className="text-xs text-neutral-500">Inspecciona y exporta el esqueleto criptográfico compilado de tu billetera Ataraxia</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column Settings */}
                  <div className="p-6 bg-white border border-gray-205 rounded-[20px] space-y-4 shadow-sm">
                    <span className="text-purple-700 text-[10px] tracking-widest font-mono font-black uppercase block mb-1">Estructura General</span>
                    
                    <div className="space-y-4 text-xs leading-normal">
                      {/* Policy Type dropdown container */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-neutral-600 block">Tipo de Poliza:</label>
                        <div className="relative">
                          <select
                            value={localPolicyType}
                            onChange={(e) => {
                              const val = e.target.value as 'single' | 'multi';
                              handlePolicyOrThresholdChange(val, localMultisigThreshold);
                            }}
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
                      {localPolicyType === 'multi' && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="text-xs font-extrabold text-neutral-600 block">Firmas requeridas:</label>
                          <div className="relative">
                            <select
                              value={localMultisigThreshold}
                              onChange={(e) => {
                                handlePolicyOrThresholdChange('multi', e.target.value);
                              }}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none shadow-sm cursor-pointer"
                            >
                              <option value="2 de 3">2 de 3</option>
                              <option value="3 de 5">3 de 5</option>
                              <option value="1 de 2">1 de 2</option>
                              <option value="2 de 2">2 de 2</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500 font-bold">
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Script Type dropdown container */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-neutral-600 block">Tipo de Script:</label>
                        <div className="relative">
                          <select
                            value={localScriptType}
                            onChange={(e) => handleScriptChange(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-xs font-bold text-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none appearance-none shadow-sm cursor-pointer"
                          >
                            {localPolicyType === 'single' ? (
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

                      <div className="w-full h-px bg-gray-150 my-1" />

                      {/* Timelock info indicator */}
                      <div>
                        <span className="text-neutral-450 block font-bold mb-0.5">Timelock Configurado (Plausible Recovery)</span>
                        <span className="text-neutral-800 font-extrabold block text-xs">
                          {localTimelock.absoluteActive
                            ? `Absoluto (Habilitado tras ${localTimelock.absoluteValue})`
                            : localTimelock.relativeActive
                            ? `Relativo (Habilitado tras ${localTimelock.relativeValue} días de inactividad)`
                            : 'Ninguno - Custodia pura activa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Settings */}
                  <div className="p-6 bg-white border border-gray-205 rounded-[20px] space-y-4 shadow-sm">
                    <span className="text-purple-700 text-[10px] tracking-widest font-mono font-black uppercase block mb-1">Descriptor</span>

                    <p className="text-[11px] text-neutral-500 font-semibold mb-1">
                      Copia esta receta técnica para recuperarla exactamente en Sparrow Wallet en computadoras Mac o Windows.
                    </p>

                    <div className="p-4 bg-neutral-50 rounded-xl border border-gray-205 text-emerald-700 font-mono text-[10px] break-all select-all select-word leading-relaxed shadow-inner">
                      {localDescriptor}
                    </div>

                    <button
                      onClick={() => triggerCopy(localDescriptor, 'Descriptor copiado para Sparrow')}
                      className="w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-neutral-600 rounded-xl border border-gray-205 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Copy size={13} />
                      Copiar Descriptor Completo
                    </button>
                  </div>
                </div>

                {/* Accordion 1: KEYSTORES */}
                <div className="bg-white border border-gray-205 rounded-[20px] shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setIsKeystoreAccordionOpen(!isKeystoreAccordionOpen);
                      setIsRecoveryAccordionOpen(false); // Close other to prevent visual clutter
                    }}
                    className="w-full p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors text-left font-sans select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-150">
                        <Key size={15} className="font-extrabold" />
                      </div>
                      <div>
                        <span className="text-neutral-900 font-extrabold text-sm block">Configurar Llaves Principales (KEYSTORES)</span>
                        <p className="text-[10px] text-neutral-400 font-semibold">Configura, renombra y altera las firmas nativas de tu billetera ({localKeystores.length})</p>
                      </div>
                    </div>
                    {isKeystoreAccordionOpen ? <ChevronUp size={18} className="text-neutral-500" /> : <ChevronDown size={18} className="text-neutral-500" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isKeystoreAccordionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-gray-150"
                      >
                        <div className="p-6 space-y-5 bg-neutral-50/30">
                          {/* If multiple keys, show selectors */}
                          {localKeystores.length > 1 && (
                            <div className="flex gap-2 p-1 bg-neutral-105 rounded-xl">
                              {localKeystores.map((k, idx) => (
                                <button
                                  type="button"
                                  key={k.id}
                                  onClick={() => setActiveEditKeystoreIdx(idx)}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    activeEditKeystoreIdx === idx
                                      ? 'bg-neutral-900 text-white shadow-sm font-black'
                                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/40'
                                  }`}
                                >
                                  Key #{idx + 1}: {k.name}
                                </button>
                              ))}
                            </div>
                          )}

                          {(() => {
                            const activeK = localKeystores[activeEditKeystoreIdx] || localKeystores[0];
                            if (!activeK) return null;
                            return (
                              <div className="space-y-4 text-xs">
                                {/* Key Name Input */}
                                <div className="space-y-1.5 text-left">
                                  <label className="text-xs font-bold text-neutral-600 block">Nombre de la Key de Firma:</label>
                                  <input
                                    type="text"
                                    value={activeK.name}
                                    onChange={(e) => handleUpdateKeystore(activeEditKeystoreIdx, { name: e.target.value })}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-850 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none shadow-xs"
                                    placeholder="e.g. Mi Ledger Llave Principal"
                                  />
                                </div>

                                {/* Key type selector */}
                                <div className="space-y-1.5 text-left">
                                  <label className="text-xs font-bold text-neutral-600 block">Tipo de Dispositivo / Llave:</label>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                    {[
                                      { type: 'private-key', label: 'Llave Privada', icon: Key, color: 'text-red-650', desc: 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]', fp: 'A3F8E122' },
                                      { type: 'magic-word', label: 'Magic word', icon: FileText, color: 'text-purple-655', desc: '12 Palabras en Español / Billetera Semilla [Mnemonic BIP39]', fp: 'B5D90F3A' },
                                      { type: 'hot-key', label: 'Hotwallet Key', icon: Smartphone, color: 'text-blue-650', desc: 'Secp256k1 Clave Efímera en Dispositivo Móvil', fp: '9CE543BD' },
                                      { type: 'xpub', label: 'xpub/watchonly', icon: Eye, color: 'text-amber-650', desc: 'xpub6FRy2UryG6S8sK9GtpmybtHYSZEEry4a5M8S... [Ver Solo]', fp: '7D1A2C3E' }
                                    ].map((opt) => (
                                      <button
                                        type="button"
                                        key={opt.type}
                                        onClick={() => {
                                          handleOpenKeystoreModal(opt.type as 'private-key' | 'magic-word' | 'hot-key' | 'xpub');
                                        }}
                                        className={`py-3 px-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                                          activeK.type === opt.type
                                            ? 'border-purple-700 bg-purple-50/50 text-purple-900 border-2 font-black shadow-xs scale-[1.01]'
                                            : 'border-gray-200 bg-white hover:bg-neutral-50 text-neutral-600 font-bold'
                                        }`}
                                      >
                                        <opt.icon size={15} className={activeK.type === opt.type ? opt.color : 'text-gray-400'} />
                                        <span className="text-[10px] leading-tight block">{opt.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Fingerprint & Key Data inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="space-y-1 md:col-span-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono">Fingerprint ID:</label>
                                    <input
                                      type="text"
                                      value={activeK.fingerprint}
                                      maxLength={8}
                                      onChange={(e) => handleUpdateKeystore(activeEditKeystoreIdx, { fingerprint: e.target.value.toUpperCase() })}
                                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-neutral-800"
                                    />
                                  </div>

                                  <div className="space-y-1 md:col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase font-mono">Hardware Key data / XPUB:</label>
                                    <input
                                      type="text"
                                      value={activeK.keyData}
                                      onChange={(e) => handleUpdateKeystore(activeEditKeystoreIdx, { keyData: e.target.value })}
                                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-800"
                                    />
                                  </div>
                                </div>

                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[10px] font-bold flex items-center gap-1.5 font-sans">
                                  <span>✅</span>
                                  <span>Llave editada con éxito. El descriptor general se actualiza automáticamente con los nuevos índices de derivación.</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 2: RECOVERY KEYS */}
                <div className="bg-white border border-gray-205 rounded-[20px] shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryAccordionOpen(!isRecoveryAccordionOpen);
                      setIsKeystoreAccordionOpen(false); // Close other to prevent visual clutter
                    }}
                    className="w-full p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors text-left font-sans select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-150">
                        <Clock size={15} className="font-extrabold" />
                      </div>
                      <div>
                        <span className="text-neutral-900 font-extrabold text-sm block">Configurar Llaves de Recuperación (RECOVERY KEYS)</span>
                        <p className="text-[10px] text-neutral-400 font-semibold">Edita tus cláusulas de herencia, bloqueo de tiempo absoluto o relativo</p>
                      </div>
                    </div>
                    {isRecoveryAccordionOpen ? <ChevronUp size={18} className="text-neutral-500" /> : <ChevronDown size={18} className="text-neutral-500" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isRecoveryAccordionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-gray-150"
                      >
                        <div className="p-6 space-y-5 bg-neutral-50/30 text-xs">
                          {/* Switch to enable or disable recovery keys */}
                          <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-4 select-none shadow-sm">
                            <div className="space-y-0.5 text-left">
                              <span className="font-extrabold text-neutral-800 flex items-center gap-1.5 font-sans font-black">
                                <Clock size={13} className="text-purple-600" />
                                Permitir configuración de RECOVERY KEYS
                              </span>
                              <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                                Habilita esta opción para activar los timelocks absolutos o relativos de seguridad de respaldo.
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                              <input
                                type="checkbox"
                                checked={recoveryKeysActivated}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setRecoveryKeysActivated(val);
                                  if (!val) {
                                    handleUpdateTimelock({
                                      absoluteActive: false,
                                      relativeActive: false,
                                    });
                                  } else {
                                    // re-read from current localRecoveryKeys selection
                                    const hasAbsolute = localRecoveryKeys.some(r => r.type === 'Timelocker absoluto');
                                    const hasRelative = localRecoveryKeys.some(r => r.type === 'Timelocker relativo');
                                    const firstAbsolute = localRecoveryKeys.find(r => r.type === 'Timelocker absoluto');
                                    const firstRelative = localRecoveryKeys.find(r => r.type === 'Timelocker relativo');
                                    const firstNotif = localRecoveryKeys.some(r => r.notifications === 'Sí');
                                    
                                    let relValueNum = 90;
                                    if (firstRelative) {
                                      const matches = firstRelative.availability.match(/\d+/);
                                      if (matches) relValueNum = parseInt(matches[0], 10);
                                    }

                                    handleUpdateTimelock({
                                      absoluteActive: hasAbsolute,
                                      absoluteValue: firstAbsolute?.availability || '2026-12-31',
                                      relativeActive: hasRelative,
                                      relativeValue: relValueNum,
                                      allowNotifications: firstNotif
                                    });
                                  }
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-700"></div>
                            </label>
                          </div>

                          {recoveryKeysActivated && (
                            <div className="space-y-4 animate-fade-in text-left">
                              {/* Header & button */}
                              <div className="flex items-center justify-between pb-1 pt-2">
                                <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                  RECOVERY KEYS ACTIVAS
                                </h4>
                                <button
                                  type="button"
                                  onClick={handleAddRecoveryKey}
                                  className="border border-neutral-900 px-3 py-1.5 rounded-full text-[11px] font-black hover:bg-neutral-50 text-neutral-900 shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] transition-all font-sans"
                                >
                                  Adherir Recovery Key
                                  <Plus size={14} className="stroke-[3]" />
                                </button>
                              </div>

                              {/* Collapsible Key cards rendering */}
                              <div className="space-y-3">
                                {localRecoveryKeys.map((rec, index) => (
                                  <div
                                    key={rec.id}
                                    className="border border-neutral-300 rounded-[20px] bg-white overflow-hidden shadow-sm text-left"
                                  >
                                    {/* Header toggle */}
                                    <div
                                      onClick={() => toggleRecoveryCollapse(rec.id)}
                                      className="p-4 bg-neutral-50 flex items-center justify-between border-b border-gray-205 cursor-pointer select-none"
                                    >
                                      <div className="flex items-center gap-2 text-left">
                                        <Clock size={14} className="text-purple-650" />
                                        <span className="text-xs font-black text-neutral-805 font-sans">
                                          Recovery Key #{index + 1}
                                        </span>
                                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-150 px-2 py-0.5 rounded-md ml-2 font-mono">
                                          {rec.type}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {localRecoveryKeys.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={(e) => handleRemoveRecoveryKey(rec.id, e)}
                                            className="p-1 hover:text-red-600 text-gray-400 rounded transition-colors cursor-pointer"
                                            title="Remover llave de recuperación"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                        {rec.isOpen ? <ChevronUp size={16} className="text-neutral-500" /> : <ChevronDown size={16} className="text-neutral-500" />}
                                      </div>
                                    </div>

                                    {/* Expandable fields drawer */}
                                    {rec.isOpen && (
                                      <div className="p-5 space-y-4 text-xs text-left">
                                        {/* 1. Tipo de recovery key */}
                                        <div className="space-y-1.5 text-left">
                                          <span className="font-bold text-neutral-600 block">Tipo de Recovery Key:</span>
                                          <div className="relative">
                                            <select
                                              value={rec.type}
                                              onChange={(e) => {
                                                const rawType = e.target.value as 'Timelocker absoluto' | 'Timelocker relativo';
                                                const defaultAv = rawType === 'Timelocker absoluto' ? '2026-12-31' : '90 días, 11horas, 9 minutos';
                                                
                                                updateRecoveryKey(rec.id, {
                                                  type: rawType,
                                                  availability: defaultAv
                                                });

                                                if (rawType === 'Timelocker absoluto') {
                                                  setActiveCalendars(prev => ({
                                                    ...prev,
                                                    [rec.id]: { month: 11, year: 2026, isOpen: true }
                                                  }));
                                                } else {
                                                  setActiveCalendars(prev => ({
                                                    ...prev,
                                                    [rec.id]: { month: 11, year: 2026, isOpen: false }
                                                  }));
                                                }
                                              }}
                                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-800 focus:border-purple-650 focus:ring-1 focus:ring-purple-650 outline-none appearance-none cursor-pointer"
                                            >
                                              <option value="Timelocker absoluto">Timelocker absoluto</option>
                                              <option value="Timelocker relativo">Timelocker relativo</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                                              <ChevronDown size={14} />
                                            </div>
                                          </div>
                                        </div>

                                        {/* 2. Disponibilidad */}
                                        {rec.type === 'Timelocker relativo' ? (
                                          <div className="space-y-1.5 text-left animate-fade-in">
                                            <span className="font-bold text-neutral-600 block font-sans">Disponibilidad (Relativo):</span>
                                            <input
                                              type="text"
                                              value={rec.availability}
                                              onChange={(e) => updateRecoveryKey(rec.id, { availability: e.target.value })}
                                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-800 focus:border-purple-650 focus:ring-1 focus:ring-purple-650 outline-none font-mono"
                                              placeholder="ej. 90 días, 11horas, 9 minutos"
                                            />
                                            <p className="text-[10px] text-gray-400 italic font-medium leading-tight">
                                              Establece los parámetros del timelock relativo antes de que se habilite esta llave de respaldo.
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="space-y-1.5 text-left animate-fade-in">
                                            <span className="font-bold text-neutral-600 block font-sans">Disponibilidad (Absoluto - Fecha Límite):</span>
                                            
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
                                                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-28 py-2.5 text-xs font-black text-neutral-808 focus:border-purple-650 outline-none cursor-pointer hover:border-purple-650 hover:bg-neutral-50/50 transition-all font-mono"
                                                placeholder="Haz click para abrir el calendario"
                                              />
                                              <div className="absolute left-3.5 top-3 text-purple-600">
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
                                                  className="bg-purple-100/40 hover:bg-purple-100 text-purple-700 text-[9px] font-black px-2.5 py-1.5 rounded-lg border border-purple-200/50 flex items-center gap-1 transition-all cursor-pointer"
                                                >
                                                  <Sparkles size={10} />
                                                  {activeCalendars[rec.id]?.isOpen ? 'Cerrar' : 'Calendario'}
                                                </button>
                                              </div>
                                            </div>

                                            <p className="text-[10px] text-gray-400 italic font-medium leading-tight">
                                              Establece la fecha exacta del bloqueo absoluto. Haz clic en el campo o en el botón "Calendario" para ver el mini calendario interactivo.
                                            </p>

                                            {/* Date Picker Drawer */}
                                            {activeCalendars[rec.id]?.isOpen && (
                                              <div className="p-4 mt-2 bg-neutral-50/70 border border-neutral-205 rounded-[18px] shadow-inner space-y-3 relative z-10 transition-all max-w-[280px] mx-auto">
                                                <div className="flex items-center justify-between">
                                                  <button
                                                    type="button"
                                                    onClick={() => handlePrevMonth(rec.id)}
                                                    className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors cursor-pointer"
                                                  >
                                                    <ChevronLeft size={15} />
                                                  </button>
                                                  
                                                  <span className="text-xs font-black text-neutral-800 font-sans">
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

                                                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-neutral-400 uppercase">
                                                  <span>Do</span>
                                                  <span>Lu</span>
                                                  <span>Ma</span>
                                                  <span>Mi</span>
                                                  <span>Ju</span>
                                                  <span>Vi</span>
                                                  <span>Sá</span>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 text-center">
                                                  {renderCalendarDays(rec.id, rec.availability)}
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-gray-200">
                                                  <div className="flex gap-1 bg-transparent">
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
                                                    className="text-[9px] font-black bg-neutral-900 text-white hover:bg-neutral-850 rounded-lg px-3 py-1 cursor-pointer transition-colors"
                                                  >
                                                    Aceptar
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* 3. Notificaciones preventivas */}
                                        <div className="space-y-1.5 text-left">
                                          <span className="font-bold text-neutral-600 block font-sans">Notificaciones:</span>
                                          <div className="relative">
                                            <select
                                              value={rec.notifications}
                                              onChange={(e) => updateRecoveryKey(rec.id, { notifications: e.target.value as any })}
                                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-800 focus:border-purple-650 outline-none appearance-none cursor-pointer"
                                            >
                                              <option value="Sí">Sí</option>
                                              <option value="No">No</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-500">
                                              <ChevronDown size={14} />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-3 bg-purple-50/45 border border-purple-150 rounded-xl text-purple-800 text-[10px] font-bold flex items-center gap-1.5 font-sans">
                            <span>💡</span>
                            <span>Cláusulas de timelock guardadas en la configuración Ataraxia. Las rutas de recuperación se recalculan de forma dinámica.</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ============== REPASAR FUNDAMENTOS TAB ============== */}
            {activeTab === 'fundamentos' && (
              <div id="tab-fundamentos" className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900">Glosario Interactivo y Fundamentos Bitcoin</h3>
                  <p className="text-xs text-neutral-500">Explora de forma amigable la jerga técnica para empoderar tu autocustodia</p>
                </div>

                {/* Segmented Sub-Tab Switcher */}
                <div className="flex border-b border-gray-150">
                  <button
                    onClick={() => setFundamentosSubTab('glosario')}
                    className={`pb-3 px-6 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                      fundamentosSubTab === 'glosario'
                        ? 'border-[#B7A6FF] text-purple-700'
                        : 'border-transparent text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    <BookOpen size={16} />
                    Glosario Interactivo ({glossaryData.length})
                  </button>
                  <button
                    onClick={() => {
                      setFundamentosSubTab('flashcards');
                      setIsCardFlipped(false);
                    }}
                    className={`pb-3 px-6 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                      fundamentosSubTab === 'flashcards'
                        ? 'border-[#B7A6FF] text-purple-700'
                        : 'border-transparent text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    <Sparkles size={16} className={fundamentosSubTab === 'flashcards' ? 'text-amber-500' : ''} />
                    Tarjetas de Estudio / Flashcards
                    <span className="text-[9px] bg-red-50 text-[#E60023] px-2 py-0.5 rounded-full font-black border border-red-100">
                      NUEVO
                    </span>
                  </button>
                </div>

                {fundamentosSubTab === 'glosario' ? (
                  <>
                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Search layout */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
                        <input
                          type="text"
                          value={glossaryFilter}
                          onChange={(e) => setGlossaryFilter(e.target.value)}
                          placeholder="Buscar por término (ej: XPUB, autocustodia, timelock)"
                          className="w-full bg-white border border-gray-305 pl-9 pr-4 py-2.5 rounded-xl text-xs text-neutral-805 focus:border-[#B7A6FF] focus:outline-none shadow-sm"
                        />
                      </div>

                      {/* Category select block */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
                        {([
                          { id: 'all', label: 'Todos' },
                          { id: 'ataraxia', label: 'Ataraxia Core' },
                          { id: 'seguridad', label: 'Seguridad' },
                          { id: 'avanzado', label: 'Avanzado' },
                          { id: 'wallet', label: 'Básico' }
                        ]).map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setGlossaryCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                              glossaryCategory === cat.id
                                ? 'bg-neutral-900 text-white font-extrabold shadow-sm cursor-pointer'
                                : 'bg-neutral-50 border border-gray-205 text-neutral-600 hover:bg-neutral-100 cursor-pointer'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive bento cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {glossaryData
                        .filter(item => {
                          const matchesSearch = item.title.toLowerCase().includes(glossaryFilter.toLowerCase()) ||
                                                item.definition.toLowerCase().includes(glossaryFilter.toLowerCase());
                          const matchesCategory = glossaryCategory === 'all' || item.category === glossaryCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map(item => (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.015, borderColor: 'rgba(183, 166, 255, 0.8)' }}
                            onClick={() => onOpenTerm(item.id)}
                            className="p-6 bg-white border border-gray-205 hover:border-[#B7A6FF] transition-all rounded-2xl cursor-pointer flex flex-col justify-between text-left group shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] bg-purple-50 text-purple-750 px-2 py-0.5 rounded-full border border-purple-100 font-extrabold tracking-wider">
                                  {item.category === 'ataraxia' ? 'Ataraxia Core' : item.category === 'seguridad' ? 'Seguridad' : item.category === 'avanzado' ? 'Concepto' : 'Básico'}
                                </span>
                                <HelpCircle size={14} className="text-neutral-300 group-hover:text-[#B7A6FF] transition-colors" />
                              </div>
                              
                              <h4 className="text-sm font-extrabold text-neutral-850 mb-2 group-hover:text-purple-700 transition-colors font-sans">
                                {item.title}
                              </h4>
                              
                              <p className="text-xs text-neutral-520 leading-relaxed line-clamp-3 font-sans font-semibold">
                                {item.definition}
                              </p>
                            </div>

                            <span className="text-[10px] font-black text-purple-700 mt-4 hover:underline flex items-center gap-1">
                              Leer más <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </motion.div>
                        ))
                      }
                    </div>
                  </>
                ) : (
                  /* ================= FLASHCARD VIEW ================= */
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Intro card and self evaluation metric box */}
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-[24px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-xl text-left">
                        <h4 className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5 font-sans">
                          <Sparkles size={16} className="text-amber-500 animate-pulse" />
                          Sistema de Autoevaluación Criptográfica
                        </h4>
                        <p className="text-xs text-neutral-600 leading-relaxed font-semibold font-sans">
                          Gira cada tarjeta interactiva para repasar los conceptos fundamentales de Ataraxia y la custodia soberana en México. Evalúate marcando cada concepto como comprendido.
                        </p>
                      </div>

                      {/* Score metrics element */}
                      <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-inner flex flex-col justify-center min-w-[200px] text-center shrink-0">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider font-sans">
                          Conceptos Dominados
                        </span>
                        <div className="text-xl font-black font-display text-purple-800 mt-1 font-mono">
                          {masteredCards.length} de {flashcards.length}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-100 h-2 rounded-full mt-2 overflow-hidden border border-neutral-200">
                          <div
                            className="bg-purple-600 h-full transition-all duration-500"
                            style={{ width: `${(masteredCards.length / flashcards.length) * 100}%` }}
                          />
                        </div>

                        {/* Ranks */}
                        <span className="text-[10px] font-bold text-neutral-500 mt-2 block font-sans">
                          Nivel: {masteredCards.length === flashcards.length ? 'Soberano de Ataraxia 👑' : masteredCards.length >= 3 ? 'Estratega Criptográfico 🛡️' : 'Iniciando Autocustodia 💡'}
                        </span>
                      </div>
                    </div>

                    {/* Celebration Banner when completed */}
                    {masteredCards.length === flashcards.length && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-800 font-extrabold font-sans"
                      >
                        🎉 ¡Excelente trabajo! Has dominado todos los fundamentos clave para resguardar tus satoshis de forma soberana con Ataraxia. ¡La autocustodia es tu mayor superpoder!
                      </motion.div>
                    )}

                    {/* Core Flashcard area with 3D animation perspective */}
                    <div className="py-4 flex flex-col items-center">
                      <div
                        className="w-full max-w-md h-80 cursor-pointer [perspective:1000px] relative select-none"
                        onClick={() => setIsCardFlipped(prev => !prev)}
                      >
                        <motion.div
                          className="w-full h-full relative"
                          style={{ transformStyle: 'preserve-3d' }}
                          animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {/* FRONT FACE (Pregunta) */}
                          <div
                            className="absolute inset-0 w-full h-full rounded-[30px] p-8 bg-white border border-gray-205 shadow-md flex flex-col justify-between select-none"
                            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-red-50 text-[#E60023] px-3 py-1 rounded-full font-black border border-red-100 tracking-wider font-sans">
                                {flashcards[currentCardIndex].tag}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">
                                Tarjeta {currentCardIndex + 1} de {flashcards.length}
                              </span>
                            </div>

                            <div className="flex-1 flex items-center justify-center text-center px-2">
                              <h4 className="text-base md:text-lg font-extrabold text-neutral-805 leading-relaxed font-sans">
                                {flashcards[currentCardIndex].question}
                              </h4>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-purple-700 animate-pulse font-sans">
                              <RefreshCw size={13} className="text-purple-500" />
                              <span>Tocar tarjeta para revelar respuesta</span>
                            </div>
                          </div>

                          {/* BACK FACE (Respuesta) */}
                          <div
                            className="absolute inset-0 w-full h-full rounded-[30px] p-8 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-md flex flex-col justify-between select-none"
                            style={{
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-purple-100 text-purple-750 px-3 py-1 rounded-full font-black border border-purple-200 tracking-wider font-sans">
                                {flashcards[currentCardIndex].concept}
                              </span>
                              <span className="text-[10px] text-purple-500 font-mono font-bold uppercase tracking-wider">
                                Ataraxia Core
                              </span>
                            </div>

                            <div className="flex-1 flex items-center justify-center text-center px-1 overflow-y-auto">
                              <p className="text-xs md:text-sm text-neutral-800 leading-relaxed font-semibold font-sans">
                                {flashcards[currentCardIndex].answer}
                              </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 font-sans">
                              <RefreshCw size={13} />
                              <span>Tocar para ver la pregunta</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Swipe / Next deck controls */}
                      <div className="w-full max-w-md flex items-center justify-between mt-6 px-2">
                        {/* Control buttons */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentCardIndex(prev => (prev === 0 ? flashcards.length - 1 : prev - 1));
                            setIsCardFlipped(false);
                          }}
                          className="p-3 bg-white border border-gray-205 rounded-xl text-neutral-700 hover:bg-neutral-50 shadow-sm font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          ◄ Anterior
                        </button>

                        <div className="flex gap-2">
                          {/* Mastered / Study mark buttons */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle mastery status
                              if (masteredCards.includes(currentCardIndex)) {
                                setMasteredCards(prev => prev.filter(idx => idx !== currentCardIndex));
                              } else {
                                setMasteredCards(prev => [...prev, currentCardIndex]);
                              }
                            }}
                            className={`p-3 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all border ${
                              masteredCards.includes(currentCardIndex)
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-white border-gray-205 text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            {masteredCards.includes(currentCardIndex) ? 'Comprendido ✅' : '¡Ya me lo sé! 👍'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCardFlipped(prev => !prev);
                            }}
                            className="p-3 bg-neutral-900 border border-neutral-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-neutral-800 transition-all"
                          >
                            <RefreshCw size={13} />
                            Voltear
                          </button>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentCardIndex(prev => (prev === flashcards.length - 1 ? 0 : prev + 1));
                            setIsCardFlipped(false);
                          }}
                          className="p-3 bg-white border border-gray-205 rounded-xl text-neutral-700 hover:bg-neutral-50 shadow-sm font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Siguiente ►
                        </button>
                      </div>

                      {/* Current tracker pagination pills */}
                      <div className="flex justify-center gap-1.5 mt-5">
                        {flashcards.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentCardIndex(idx);
                              setIsCardFlipped(false);
                            }}
                            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                              currentCardIndex === idx
                                ? 'bg-purple-700 w-6'
                                : masteredCards.includes(idx)
                                ? 'bg-emerald-400'
                                : 'bg-neutral-300 hover:bg-neutral-400'
                            }`}
                            title={`Ir a Tarjeta ${idx + 1}`}
                          />
                        ))}
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* Keystore Config Modals (Mirroring SetupScreen) */}
      <AnimatePresence>
        {activeKeystoreModal && (
          <div id="dashboard-keystore-modal" className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
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
                          setCopiedNotification("❌ Las contraseñas no coinciden.");
                          setTimeout(() => setCopiedNotification(null), 2000);
                          return;
                        }
                        updateActiveKeystore({
                          type: 'private-key',
                          fingerprint: 'A3F8E122',
                          keyData: 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]'
                        });
                        setActiveKeystoreModal(null);
                        setCopiedNotification("✅ Llave Privada configurada y guardada locales.");
                        setTimeout(() => setCopiedNotification(null), 2000);
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
                        setCopiedNotification(`✅ Magic Word guardado con ${magicWordUses} usos disponibles.`);
                        setTimeout(() => setCopiedNotification(null), 2000);
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

                  <p className="text-xs text-neutral-650 leading-relaxed font-semibold">
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
                          setCopiedNotification("🚀 Frase semilla generada aleatoriamente.");
                          setTimeout(() => setCopiedNotification(null), 2000);
                        }}
                        className="flex-grow py-3 text-xs font-black bg-neutral-100 hover:bg-neutral-200 text-neutral-850 rounded-xl shadow-sm cursor-pointer transition-colors"
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
                        setCopiedNotification("✅ Hotwallet Key guardada locales.");
                        setTimeout(() => setCopiedNotification(null), 2000);
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
                        value={xpubValue}
                        onChange={(e) => setXpubValue(e.target.value)}
                        rows={3}
                        className="w-full bg-neutral-50 hover:bg-neutral-100/50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-850 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all font-mono leading-normal resize-none"
                        placeholder="xpub6FRy2Ury..."
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
                          fingerprint: xpubFingerprint || '7D1A2C3E',
                          keyData: `${xpubDeviceType} (${xpubDerivation}): ${xpubValue.substring(0, 24)}...`
                        });
                        setActiveKeystoreModal(null);
                        setCopiedNotification("✅ xpub/watchonly configurada locales.");
                        setTimeout(() => setCopiedNotification(null), 2000);
                      }}
                      className="flex-1 py-3 text-xs font-black bg-neutral-950 text-white rounded-xl hover:bg-neutral-850 active:scale-95 transition-all text-center cursor-pointer shadow-md shadow-neutral-900/10"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
