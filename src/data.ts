import { GlossaryItem, Transaction, Keystore } from './types';

/**
 * Standard exchange rate for the simulation
 * 97,500 sats corresponds to $1,387.04 MXN and $79.50 USD as requested
 * Rate MXN = 1387.04 / 97500 = 0.014226051282051282 MXN per sat
 * Rate USD = 79.50 / 97500 = 0.0008153846153846154 USD per sat
 */
export const SATS_TO_MXN_RATE = 0.014226051282051282;
export const SATS_TO_USD_RATE = 0.0008153846153846154;

export const formatSats = (sats: number): string => {
  return sats.toLocaleString('es-MX');
};

export const formatMxn = (mxn: number): string => {
  return mxn.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatUsd = (usd: number): string => {
  return usd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const initialTransactions: Transaction[] = [
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
];

export const defaultKeystores: Keystore[] = [
  {
    id: 'ks-1',
    name: 'Llave Principal (Ataraxia)',
    type: 'private-key',
    fingerprint: 'A3F8E122',
    keyData: 'scrypt(16384, 8, 1) + aes-256-cbc [Encriptada Localmente]',
  },
  {
    id: 'ks-2',
    name: 'Magic Word (Frase de Recuperación)',
    type: 'magic-word',
    fingerprint: 'B5D90F3A',
    keyData: '12 Palabras en Español / Billetera Semilla [Mnemonic BIP39]',
  },
  {
    id: 'ks-3',
    name: 'Hot Wallet Recovery (Celular)',
    type: 'hot-key',
    fingerprint: '9CE543BD',
    keyData: 'Secp256k1 Clave Efímera en Dispositivo Móvil',
  },
  {
    id: 'ks-4',
    name: 'Familiar de Confianza (XPUB Only)',
    type: 'xpub',
    fingerprint: '7D1A2C3E',
    keyData: 'xpub661MyMwAqRbcFtXeN9g9hcK8wL6wN9g5xQpUtW4d... [Ver Solo]',
  }
];

export const glossaryData: GlossaryItem[] = [
  {
    id: 'ataraxia',
    title: 'Ataraxia',
    definition: 'Somos la primera propuesta de cartera digital en Mérida dirigida a nuevos usuarios interesados a emprender en el mundo bitcoin, en ella encontrarás todo lo que necesitas para poder empezar la auto custodia de tu wallet en minutos, conocer las entradas, salidas y gestionar las llaves privadas, y públicas de tu billetera de criptomonedas de una forma intuitiva, práctica y segura.',
    category: 'ataraxia',
    iconName: 'Sparkles',
  },
  {
    id: 'autocustodia',
    title: 'Autocustodia',
    definition: 'En Ataraxia nos dedicamos a facilitarte la vida para que puedas hacer un uso recurrente de tu wallet; mediante buenos hábitos, y un sistema que agilice la gestión de tus cripto activos de forma intuitiva, rápida y segura.',
    category: 'seguridad',
    iconName: 'Shield',
  },
  {
    id: 'descriptor',
    title: 'Descriptor',
    definition: 'String que describe completamente cómo generar direcciones en una wallet Bitcoin, es decir, son los componentes internos que le dicen al sistema cómo configurar la wallet.',
    category: 'avanzado',
    iconName: 'Code',
  },
  {
    id: 'xpub',
    title: 'XPUB (Clave Pública Extendida)',
    definition: 'Llave pública extendida padre, es decir, es el identificador maestro que sueles copiar y pegar en cada transacción de cripto monedas, de igual manera, genera infinitas direcciones sin exponer la llave privada, lo cual, te brinda un máximo nivel de seguridad en cada transferencia.',
    category: 'avanzado',
    iconName: 'KeyRound',
  },
  {
    id: 'llaves-privadas',
    title: 'Llaves privadas',
    definition: 'Un conjunto de palabras claves en un orden específico definido que le brindan autenticidad criptográfica a tu wallet, sin embargo, bajo ningún concepto compartas la llave privada, ya que solo se utiliza para que internamente puedas identificar tus propias wallets y por lo tanto, debes tenerla muy bien resguardada.',
    category: 'seguridad',
    iconName: 'Key',
  },
  {
    id: 'derivation-path',
    title: 'Derivation Path (Derevi.path)',
    definition: 'La ruta interna por la que ha pasado tu llave pública; clave para rastrear los respaldos y las transacciones que realizas.',
    category: 'avanzado',
    iconName: 'Milestone',
  },
  {
    id: 'fingerprint',
    title: 'Fingerprint (Huella)',
    definition: 'ID de la wallet que consta de 8 caracteres, es decir, representa la guella digital de tu billetera.',
    category: 'seguridad',
    iconName: 'Fingerprint',
  },
  {
    id: 'miniscript',
    title: 'Miniscript',
    definition: 'Lenguaje para escribir condiciones de gasto que ocurren tras una transferencia de cripto activos de forma estructurada y legible para una computadora.',
    category: 'avanzado',
    iconName: 'FileCode',
  },
  {
    id: 'timelocker',
    title: 'Timelocker',
    definition: 'Es una regla pre-programada en el código interno de la wallet que bloquea los fondos temporalmente, lo cual, te permite generar mecanismos de seguridad robustos, te permite crear medidas de respaldo del acceso de tu wallet y te facilita disponer tu wallet como un recurso que se puede heredar a otras personas o a una cuenta de respaldo de forma segura y automática.',
    category: 'seguridad',
    iconName: 'Lock',
  },
  {
    id: 'timelock-absoluto',
    title: 'Timelock absoluto',
    definition: 'Aquel que usa la función after, es decir, una fecha fija o un día exacto en el calendario. Ejemplo: El respaldo estará habilitado el 7 de junio del 2026.',
    category: 'seguridad',
    iconName: 'CalendarDays',
  },
  {
    id: 'timelock-relativo',
    title: 'Timelock relativo',
    definition: 'Aquel que usa la función “older”, es decir, es una fecha dinámica establecida en el momento exacto en el que la defines. Ejemplo: El respaldo estará habilitado 30 días después de que realizas un depósito a tu wallet.',
    category: 'seguridad',
    iconName: 'Timer',
  },
  {
    id: 'recovery-keys',
    title: 'Recovery Keys (Claves de Recuperación)',
    definition: 'Llaves auxiliares con las que puedes acceder a una wallet o traspasar tus fondos a una cuenta secundaria de confianza tras un tiempo predefinido.',
    category: 'seguridad',
    iconName: 'ShieldAlert',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    definition: 'Cartera digital que te permite recibir, enviar y guardar Bitcoin (BTC) con seguridad. De tal modo, que mediante la misma puedas gestionar las llaves privadas y públicas necesarias para acceder a tus monedas. Sin una cartera de Bitcoin, no puedes realizar transacciones con BTC.',
    category: 'wallet',
    iconName: 'Wallet',
  },
];
