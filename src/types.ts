/**
 * Types and interfaces for Ataraxia Bitcoin Wallet MVP
 */

export type ViewType = 'inicio' | 'crear' | 'principal';

export type SidebarTab =
  | 'resumen'
  | 'transacciones'
  | 'enviar'
  | 'recibir'
  | 'historial'
  | 'ark-link'
  | 'configuracion'
  | 'fundamentos';

export type PolicyType = 'single' | 'multi';

export type KeystoreType = 'private-key' | 'magic-word' | 'hot-key' | 'xpub';

export interface Keystore {
  id: string;
  name: string;
  type: KeystoreType;
  fingerprint: string;
  keyData: string;
  isCustom?: boolean;
}

export interface TimelockConfig {
  absoluteActive: boolean;
  absoluteValue: string; // e.g. "2026-06-07"
  relativeActive: boolean;
  relativeValue: number; // e.g. 30 (days)
  allowNotifications: boolean;
}

export interface Transaction {
  id: string;
  type: 'entrada' | 'salida';
  sender: string;
  recipient: string;
  amountSats: number;
  amountMxn: number;
  date: string;
  time: string;
  confirmations: number;
  txid: string;
  isArk?: boolean;
}

export interface GlossaryItem {
  id: string;
  title: string;
  definition: string;
  category: 'wallet' | 'seguridad' | 'avanzado' | 'ataraxia';
  iconName: string;
}
