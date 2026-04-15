import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Node } from '@xyflow/react';
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useDebouncedCallback, useDebouncedValue } from '@mantine/hooks';
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconLayout, IconPlus } from '@tabler/icons-react';
import type { GrammarRule } from '../../engine/types';
import {
  ensureRulesForReferences,
  findMissingRefs,
  grammarLayoutFingerprint,
  renameRule,
} from '../../engine/grammarGraphModel';
import {
  buildLaidOutFlow,
  getGrammarFlowNodeCenter,
  GRAMMAR_SYMBOL_NODE_TYPE,
  type GrammarSymbolNodeData,
} from '../../lib/grammarToFlow';
import { GrammarSymbolNode } from './GrammarSymbolNode';

/** Delay before lifting graph edits to parent (engine, JSON sync, results). */
const COMMIT_MS = 200;

/** Debounce dagre + flow rebuild when layout fingerprint is unchanged (literal-only edits). */
const LAYOUT_DEBOUNCE_MS = 100;

const nodeTypes = { [GRAMMAR_SYMBOL_NODE_TYPE]: GrammarSymbolNode };

/** Slight zoom-out factor when refocusing after new nodes; clamps keep the view readable. */
const FOCUS_ZOOM_FACTOR = 0.94;
const FOCUS_ZOOM_MIN = 0.42;
const FOCUS_ZOOM_MAX = 1.4;

function GraphViewportFocus({
  laidOut,
  grammar,
  focus,
  onFocusComplete,
}: {
  laidOut: Node<GrammarSymbolNodeData>[];
  grammar: GrammarRule;
  focus: { id: string; token: number } | null;
  onFocusComplete: () => void;
}) {
  const { setCenter, getViewport } = useReactFlow();

  useEffect(() => {
    if (focus == null) return;
    const node = laidOut.find((n) => n.id === focus.id);
    if (!node) {
      onFocusComplete();
      return;
    }
    const { x, y } = getGrammarFlowNodeCenter(node, grammar);
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const { zoom } = getViewport();
        const z = Math.min(Math.max(zoom * FOCUS_ZOOM_FACTOR, FOCUS_ZOOM_MIN), FOCUS_ZOOM_MAX);
        void setCenter(x, y, { zoom: z, duration: 220 }).finally(() => {
          if (!cancelled) onFocusComplete();
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [focus?.id, focus?.token, laidOut, grammar, setCenter, getViewport, onFocusComplete]);

  return null;
}

function FitViewButton() {
  const { fitView } = useReactFlow();
  return (
    <Button
      className="nodrag nopan"
      size="xs"
      variant="light"
      leftSection={<IconLayout size={14} />}
      onClick={() => fitView({ padding: 0.2 })}
    >
      Fit view
    </Button>
  );
}

interface GrammarGraphViewProps {
  grammar: GrammarRule;
  onChange: (g: GrammarRule) => void;
}

function GrammarGraphInner({ grammar, onChange }: GrammarGraphViewProps) {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const isDark = colorScheme === 'dark';
  const canvasSurface = isDark ? theme.colors.dark[7] : theme.colors.gray[0];
  const canvasBorder = isDark ? theme.colors.dark[4] : theme.colors.gray[3];
  const gridPattern = isDark ? theme.colors.dark[5] : theme.colors.gray[4];

  const [draftGrammar, setDraftGrammar] = useState(grammar);
  const [deleteModalSymbol, setDeleteModalSymbol] = useState<string | null>(null);
  const [viewportFocus, setViewportFocus] = useState<{ id: string; token: number } | null>(null);

  const lastInteractedSymbolRef = useRef<string | null>(null);
  const prevRuleKeysRef = useRef<Set<string>>(new Set());
  const focusSeqRef = useRef(0);

  const clearViewportFocus = useCallback(() => {
    setViewportFocus(null);
  }, []);

  useEffect(() => {
    setDraftGrammar(grammar);
    prevRuleKeysRef.current = new Set();
  }, [grammar]);

  const debouncedCommit = useDebouncedCallback(
    (next: GrammarRule) => {
      onChange(next);
    },
    { delay: COMMIT_MS, flushOnUnmount: true },
  );

  const onAlternativesChange = useCallback(
    (symbol: string, alts: string[]) => {
      lastInteractedSymbolRef.current = symbol;
      setDraftGrammar((prev) => {
        const next = ensureRulesForReferences({ ...prev, [symbol]: alts });
        debouncedCommit(next);
        return next;
      });
    },
    [debouncedCommit],
  );

  const onAddStaticAlternative = useCallback(
    (symbol: string) => {
      lastInteractedSymbolRef.current = symbol;
      setDraftGrammar((prev) => {
        const prevAlts = prev[symbol] ?? [];
        const next = ensureRulesForReferences({ ...prev, [symbol]: [...prevAlts, ''] });
        debouncedCommit(next);
        return next;
      });
    },
    [debouncedCommit],
  );

  const onRenameRule = useCallback(
    (oldName: string, newName: string): boolean => {
      try {
        debouncedCommit.cancel();
        let nextCommitted: GrammarRule | undefined;
        setDraftGrammar((prev) => {
          nextCommitted = ensureRulesForReferences(renameRule(prev, oldName, newName));
          return nextCommitted;
        });
        if (nextCommitted) onChange(nextCommitted);
        return true;
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Rename failed');
        return false;
      }
    },
    [debouncedCommit, onChange],
  );

  const onDeleteRule = useCallback((symbol: string) => {
    if (symbol === 'origin') return;
    setDeleteModalSymbol(symbol);
  }, []);

  const confirmDeleteRule = useCallback(() => {
    const symbol = deleteModalSymbol;
    if (!symbol || symbol === 'origin') {
      setDeleteModalSymbol(null);
      return;
    }
    debouncedCommit.cancel();
    let nextCommitted: GrammarRule | undefined;
    setDraftGrammar((prev) => {
      const next = { ...prev };
      delete next[symbol];
      nextCommitted = next;
      return next;
    });
    if (nextCommitted) onChange(nextCommitted);
    setDeleteModalSymbol(null);
  }, [deleteModalSymbol, debouncedCommit, onChange]);

  const flowCallbacks = useMemo(
    () => ({
      onAlternativesChange,
      onAddStaticAlternative,
      onRenameRule,
      onDeleteRule,
    }),
    [onAlternativesChange, onAddStaticAlternative, onRenameRule, onDeleteRule],
  );

  const [debouncedLayoutGrammar] = useDebouncedValue(draftGrammar, LAYOUT_DEBOUNCE_MS);

  const layoutSource = useMemo(() => {
    const fpDraft = grammarLayoutFingerprint(draftGrammar);
    const fpDeb = grammarLayoutFingerprint(debouncedLayoutGrammar);
    if (fpDraft === fpDeb) return debouncedLayoutGrammar;
    return draftGrammar;
  }, [draftGrammar, debouncedLayoutGrammar]);

  const { nodes: laidOutBase, edges } = useMemo(
    () => buildLaidOutFlow(layoutSource, flowCallbacks),
    [layoutSource, flowCallbacks],
  );

  const laidOut = useMemo(
    () =>
      laidOutBase.map((n) => ({
        ...n,
        data: {
          ...n.data,
          alternatives: draftGrammar[n.id] ?? n.data.alternatives,
        },
      })),
    [laidOutBase, draftGrammar],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setNodes(laidOut);
    setEdges(edges);
  }, [laidOut, edges, setNodes, setEdges]);

  useEffect(() => {
    const ids = new Set(Object.keys(layoutSource));
    if (prevRuleKeysRef.current.size === 0) {
      prevRuleKeysRef.current = new Set(ids);
      return;
    }
    const added = [...ids].filter((id) => !prevRuleKeysRef.current.has(id));
    prevRuleKeysRef.current = new Set(ids);
    if (added.length === 0) return;
    const sym = lastInteractedSymbolRef.current;
    if (sym && ids.has(sym)) {
      focusSeqRef.current += 1;
      setViewportFocus({ id: sym, token: focusSeqRef.current });
    }
  }, [layoutSource]);

  const missing = useMemo(() => findMissingRefs(draftGrammar), [draftGrammar]);

  const keys = Object.keys(draftGrammar);

  if (keys.length === 0) {
    return (
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          No grammar yet. Start with a single <strong>origin</strong> node, then add alternatives. Type{' '}
          <code>#RuleName#</code> in a line to create or link another rule.
        </Text>
        <Button size="xs" leftSection={<IconPlus size={14} />} variant="light" onClick={() => onChange({ origin: [''] })}>
          New grammar (origin only)
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Modal
        opened={deleteModalSymbol !== null}
        onClose={() => setDeleteModalSymbol(null)}
        title="Delete rule"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Delete rule <strong>{deleteModalSymbol ?? ''}</strong>? References to it will break until you fix them.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setDeleteModalSymbol(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteRule}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {missing.length > 0 && (
        <Alert color="yellow" title="Unknown references">
          <Text size="xs">These #symbols# have no rule: {missing.join(', ')}</Text>
        </Alert>
      )}
      <div
        style={{
          height: 620,
          border: `1px solid ${canvasBorder}`,
          borderRadius: 8,
          overflow: 'hidden',
          background: canvasSurface,
        }}
      >
        <ReactFlow
          className={isDark ? 'dark' : undefined}
          style={{ background: canvasSurface }}
          nodes={nodes}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          selectionOnDrag={false}
          onlyRenderVisibleElements
          zoomOnScroll
          onInit={(instance) => instance.fitView({ padding: 0.2 })}
          proOptions={{ hideAttribution: true }}
          onNodeClick={() => {}}
        >
          <GraphViewportFocus
            laidOut={laidOut}
            grammar={draftGrammar}
            focus={viewportFocus}
            onFocusComplete={clearViewportFocus}
          />
          <Background color={gridPattern} gap={14} size={1.25} />
          <Controls />
          <Panel position="top-right">
            <FitViewButton />
          </Panel>
        </ReactFlow>
      </div>
      <Text size="xs" c="dimmed">
        Type <code>#Name#</code> in an alternative to link or create a rule with that name. Rename a rule in its title
        field; all <code>#Name#</code> references update. Multiple references in one line (e.g.{' '}
        <code>#SP# #VP# #OP#</code>) are supported.
      </Text>
    </Stack>
  );
}

export function GrammarGraphView(props: GrammarGraphViewProps) {
  return (
    <ReactFlowProvider>
      <GrammarGraphInner {...props} />
    </ReactFlowProvider>
  );
}
