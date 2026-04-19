import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Box, Text, UnstyledButton, useComputedColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronUp } from '@tabler/icons-react';

const STORAGE_KEY = 'gge-workspace-split-v1';
const MIN_LEFT = 300;
const MIN_RIGHT = 280;
const HANDLE_PX = 5;
const STRIP_W = 44;
const STRIP_H = 48;

function readInitialSplitPx(): number {
  if (typeof window === 'undefined') return 560;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n >= MIN_LEFT) return n;
    }
  } catch {
    /* ignore */
  }
  return Math.round(Math.min(window.innerWidth * 0.48, 720));
}

export interface EditorWorkspaceColumnsProps {
  left: React.ReactNode;
  right: React.ReactNode;
  /** Minimum height of the editor + results band when the parent does not stretch. */
  minHeight?: number | string;
  /** Merged into the root row (e.g. `flex: 1, minHeight: 0` to fill the main column). */
  style?: CSSProperties;
  /** When false, results collapse to a narrow strip (edge on desktop, bottom on mobile stack). */
  resultsExpanded?: boolean;
  onResultsExpandedChange?: (expanded: boolean) => void;
  /** Optional short note on the collapsed strip (e.g. result count). */
  resultsStripDetail?: string;
}

export function EditorWorkspaceColumns({
  left,
  right,
  minHeight = '72vh',
  style,
  resultsExpanded = true,
  onResultsExpandedChange,
  resultsStripDetail,
}: EditorWorkspaceColumnsProps) {
  const isRow = useMediaQuery('(min-width: 62em)');
  const colorScheme = useComputedColorScheme('light');
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPx, setSplitPx] = useState(readInitialSplitPx);
  const splitRef = useRef(splitPx);
  splitRef.current = splitPx;

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ originX: number; originW: number } | null>(null);

  const expanded = !onResultsExpandedChange || resultsExpanded;

  const persist = useCallback((w: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Math.round(w)));
    } catch {
      /* ignore */
    }
  }, []);

  const onResizeHandleDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = { originX: e.clientX, originW: splitRef.current };
      setIsDragging(true);
    },
    [],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !dragRef.current) return;
      const next = dragRef.current.originW + (e.clientX - dragRef.current.originX);
      const maxW = rect.width - MIN_RIGHT - HANDLE_PX;
      const clamped = Math.min(maxW, Math.max(MIN_LEFT, next));
      splitRef.current = clamped;
      setSplitPx(clamped);
    };

    const onUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      persist(splitRef.current);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [isDragging, persist]);

  const rowStyle: CSSProperties = {
    display: 'flex',
    flexDirection: isRow ? 'row' : 'column',
    alignItems: 'stretch',
    width: '100%',
    minHeight,
    minWidth: 0,
    ...style,
  };

  const leftBg = 'var(--app-surface-1)';
  const rightBg =
    colorScheme === 'dark' ? 'var(--app-surface-1)' : 'var(--app-surface-0)';

  const leftSize: CSSProperties = isRow
    ? expanded
      ? { flex: `0 0 ${splitPx}px`, minWidth: MIN_LEFT }
      : { flex: '1 1 0%', minWidth: 0, minHeight: 0 }
    : { flex: '1 1 0%', minHeight: 0, width: '100%', minWidth: 0 };

  const rightSize: CSSProperties = isRow
    ? { flex: '1 1 0%', minWidth: MIN_RIGHT }
    : { flex: '1 1 0%', minHeight: 0, width: '100%', minWidth: 0 };

  const leftShell = (
    <Box
      style={{
        ...leftSize,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        background: leftBg,
        borderRight: isRow && expanded ? '1px solid var(--app-soft-border)' : undefined,
        borderBottom: !isRow && expanded ? '1px solid var(--app-soft-border)' : undefined,
      }}
    >
      {left}
    </Box>
  );

  const rightShell = (
    <Box
      style={{
        ...rightSize,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        background: rightBg,
      }}
    >
      {right}
    </Box>
  );

  const collapsedStrip =
    onResultsExpandedChange && !expanded ? (
      <UnstyledButton
        type="button"
        onClick={() => onResultsExpandedChange(true)}
        style={{
          flexShrink: 0,
          height: isRow ? 'auto' : STRIP_H,
          minHeight: isRow ? 0 : STRIP_H,
          width: isRow ? STRIP_W : '100%',
          alignSelf: isRow ? 'stretch' : undefined,
          display: 'flex',
          flexDirection: isRow ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: isRow ? 'var(--mantine-spacing-xs) 4px' : '0 var(--mantine-spacing-md)',
          borderLeft: isRow ? '1px solid var(--app-soft-border)' : undefined,
          borderTop: !isRow ? '1px solid var(--app-soft-border)' : undefined,
          background: 'var(--app-surface-1)',
          color: 'var(--mantine-color-dimmed)',
        }}
        aria-label="Show results panel"
      >
        {isRow ? <IconChevronLeft size={18} stroke={1.5} aria-hidden /> : <IconChevronUp size={18} stroke={1.5} aria-hidden />}
        <Text
          size="xs"
          fw={600}
          ta="center"
          lh={1.25}
          style={isRow ? { textOrientation: 'mixed' as const, writingMode: 'vertical-rl' as const } : undefined}
        >
          Results{resultsStripDetail ? ` · ${resultsStripDetail}` : ''}
        </Text>
      </UnstyledButton>
    ) : null;

  return (
    <Box ref={containerRef} style={rowStyle}>
      {leftShell}
      {isRow && expanded && (
        <Box
          onPointerDown={onResizeHandleDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize grammar and results columns"
          style={{
            width: HANDLE_PX,
            flexShrink: 0,
            cursor: 'col-resize',
            alignSelf: 'stretch',
            background: isDragging ? 'var(--mantine-color-gray-5)' : 'var(--app-soft-border)',
            touchAction: 'none',
          }}
        />
      )}
      {expanded ? rightShell : collapsedStrip}
    </Box>
  );
}
