import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useDebouncedCallback } from '@mantine/hooks';
import { Alert, Button, Group, Select, Stack, Text } from '@mantine/core';
import { IconLayout, IconPlus, IconTrash } from '@tabler/icons-react';
import type { GrammarRule } from '../../engine/types';
import { ensureRulesForReferences, findMissingRefs, renameRule } from '../../engine/grammarGraphModel';
import { buildLaidOutFlow, GRAMMAR_SYMBOL_NODE_TYPE } from '../../lib/grammarToFlow';
import { GrammarSymbolNode } from './GrammarSymbolNode';

/** Delay before lifting graph edits to parent (engine, JSON sync, results). */
const COMMIT_MS = 200;

const nodeTypes = { [GRAMMAR_SYMBOL_NODE_TYPE]: GrammarSymbolNode };

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
  const [draftGrammar, setDraftGrammar] = useState(grammar);

  useEffect(() => {
    setDraftGrammar(grammar);
  }, [grammar]);

  const debouncedCommit = useDebouncedCallback(
    (next: GrammarRule) => {
      onChange(next);
    },
    { delay: COMMIT_MS, flushOnUnmount: true },
  );

  const onAlternativesChange = useCallback(
    (symbol: string, alts: string[]) => {
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

  const flowCallbacks = useMemo(
    () => ({
      onAlternativesChange,
      onAddStaticAlternative,
      onRenameRule,
    }),
    [onAlternativesChange, onAddStaticAlternative, onRenameRule],
  );

  const { nodes: laidOut, edges } = useMemo(
    () => buildLaidOutFlow(draftGrammar, flowCallbacks),
    [draftGrammar, flowCallbacks],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setNodes(laidOut);
    setEdges(edges);
  }, [laidOut, edges, setNodes, setEdges]);

  const missing = useMemo(() => findMissingRefs(draftGrammar), [draftGrammar]);

  const deletableKeys = useMemo(() => Object.keys(draftGrammar).filter((k) => k !== 'origin'), [draftGrammar]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const deleteRule = () => {
    if (!deleteTarget) return;
    if (!window.confirm(`Delete rule "${deleteTarget}"? References to it will break until you fix them.`)) return;
    debouncedCommit.cancel();
    const key = deleteTarget;
    let nextCommitted: GrammarRule | undefined;
    setDraftGrammar((prev) => {
      const next = { ...prev };
      delete next[key];
      nextCommitted = next;
      return next;
    });
    if (nextCommitted) onChange(nextCommitted);
    setDeleteTarget(null);
  };

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
      {missing.length > 0 && (
        <Alert color="yellow" title="Unknown references">
          <Text size="xs">These #symbols# have no rule: {missing.join(', ')}</Text>
        </Alert>
      )}
      {deletableKeys.length > 0 && (
        <Group align="flex-end" wrap="wrap">
          <Select
            size="xs"
            placeholder="Rule to delete"
            data={deletableKeys}
            value={deleteTarget}
            onChange={setDeleteTarget}
            w={200}
            clearable
          />
          <Button
            size="xs"
            color="red"
            variant="light"
            leftSection={<IconTrash size={14} />}
            disabled={!deleteTarget}
            onClick={deleteRule}
          >
            Delete rule
          </Button>
        </Group>
      )}
      <div style={{ height: 520, border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8, overflow: 'hidden' }}>
        <ReactFlow
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
          <Background />
          <Controls />
          <MiniMap zoomable pannable />
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
