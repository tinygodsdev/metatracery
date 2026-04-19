import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Box, useComputedColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

const STORAGE_KEY = 'gge-workspace-split-v1';
const MIN_LEFT = 300;
const MIN_RIGHT = 280;
const HANDLE_PX = 5;

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
}

export function EditorWorkspaceColumns({ left, right, minHeight = '72vh', style }: EditorWorkspaceColumnsProps) {
  const isRow = useMediaQuery('(min-width: 62em)');
  const colorScheme = useComputedColorScheme('light');
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPx, setSplitPx] = useState(readInitialSplitPx);
  const splitRef = useRef(splitPx);
  splitRef.current = splitPx;

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ originX: number; originW: number } | null>(null);

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

  const colShell = (child: React.ReactNode, opts: { isLeft: boolean }) => {
    const sizeStyles: CSSProperties = isRow
      ? opts.isLeft
        ? { flex: `0 0 ${splitPx}px`, minWidth: MIN_LEFT }
        : { flex: '1 1 0%', minWidth: MIN_RIGHT }
      : { flex: '1 1 0%', minHeight: 0, width: '100%', minWidth: 0 };

    const columnBg =
      opts.isLeft || colorScheme === 'dark' ? 'var(--app-surface-1)' : 'var(--app-surface-0)';

    return (
      <Box
        style={{
          ...sizeStyles,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
          background: columnBg,
          borderRight: isRow && opts.isLeft ? '1px solid var(--app-soft-border)' : undefined,
          borderBottom: !isRow && opts.isLeft ? '1px solid var(--app-soft-border)' : undefined,
        }}
      >
        {child}
      </Box>
    );
  };

  return (
    <Box ref={containerRef} style={rowStyle}>
      {colShell(left, { isLeft: true })}
      {isRow && (
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
      {colShell(right, { isLeft: false })}
    </Box>
  );
}
