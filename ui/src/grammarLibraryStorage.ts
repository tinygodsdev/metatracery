import type { GrammarRule } from './engine/types';
import { GRAMMAR_LIBRARY_STORAGE_KEY, STORAGE_DISCLAIMER_SESSION_KEY } from './browserStorageKeys';

/** What the editor is currently editing: user slot, a fixture, or the default example. */
export type GrammarLibrarySource = 'user' | 'fixture' | 'example';

export const GRAMMAR_LIBRARY_VERSION = 1 as const;

export interface SavedGrammarItem {
  id: string;
  name: string;
  updatedAt: string;
  grammar: GrammarRule;
}

export interface GrammarLibraryState {
  version: typeof GRAMMAR_LIBRARY_VERSION;
  items: SavedGrammarItem[];
  activeId: string | null;
}

function isGrammarRule(value: unknown): value is GrammarRule {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) return false;
  }
  return true;
}

function isSavedItem(value: unknown): value is SavedGrammarItem {
  if (value === null || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.updatedAt === 'string' &&
    isGrammarRule(o.grammar)
  );
}

/** Pure parse for tests and runtime; returns null if invalid. */
export function parseGrammarLibraryJson(json: string): GrammarLibraryState | null {
  try {
    const data: unknown = JSON.parse(json);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
    const o = data as Record<string, unknown>;
    if (o.version !== GRAMMAR_LIBRARY_VERSION) return null;
    if (!Array.isArray(o.items) || !o.items.every(isSavedItem)) return null;
    if (o.activeId !== null && typeof o.activeId !== 'string') return null;
    return {
      version: GRAMMAR_LIBRARY_VERSION,
      items: o.items,
      activeId: o.activeId === null ? null : o.activeId,
    };
  } catch {
    return null;
  }
}

export function createEmptyLibraryState(): GrammarLibraryState {
  return { version: GRAMMAR_LIBRARY_VERSION, items: [], activeId: null };
}

export function readGrammarLibraryFromLocalStorage(): GrammarLibraryState {
  if (typeof window === 'undefined') return createEmptyLibraryState();
  try {
    const raw = window.localStorage.getItem(GRAMMAR_LIBRARY_STORAGE_KEY);
    if (raw === null) return createEmptyLibraryState();
    const parsed = parseGrammarLibraryJson(raw);
    if (!parsed) {
      console.warn('[lemula-gge] Invalid grammar library in localStorage, ignoring');
      return createEmptyLibraryState();
    }
    if (parsed.activeId !== null && !parsed.items.some((i) => i.id === parsed.activeId)) {
      return { ...parsed, activeId: null };
    }
    return parsed;
  } catch {
    return createEmptyLibraryState();
  }
}

export function writeGrammarLibraryToLocalStorage(state: GrammarLibraryState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GRAMMAR_LIBRARY_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[lemula-gge] Failed to save grammar library', e);
  }
}

export function clearGrammarLibraryFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GRAMMAR_LIBRARY_STORAGE_KEY);
  } catch (e) {
    console.warn('[lemula-gge] Failed to clear grammar library', e);
  }
}

export function hasStorageDisclaimerAck(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(STORAGE_DISCLAIMER_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setStorageDisclaimerAck(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_DISCLAIMER_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}
