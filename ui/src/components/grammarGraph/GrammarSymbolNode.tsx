import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import {
  Stack,
  TextInput,
  Button,
  Group,
  ActionIcon,
  Text,
  Tooltip,
  Box,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconTrash, IconPlus, IconX, IconTypography, IconBraces } from '@tabler/icons-react';
import { isStaticAlternative } from '../../engine/grammarGraphModel';
import { GRAMMAR_FLOW_NODE_WIDTH, type GrammarSymbolNodeData } from '../../lib/grammarToFlow';
import classes from './GrammarSymbolNode.module.css';

/** Stops React Flow from capturing pointer events for pan/drag on inputs and buttons. */
const stopFlowPointer = (e: PointerEvent) => {
  e.stopPropagation();
};

export function GrammarSymbolNode({ data }: NodeProps<Node<GrammarSymbolNodeData>>) {
  const { symbol, alternatives, onAlternativesChange, onAddStaticAlternative, onRenameRule, onDeleteRule } =
    data;

  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const nodeBorder =
    colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[4];

  const [nameDraft, setNameDraft] = useState(symbol);

  useEffect(() => {
    setNameDraft(symbol);
  }, [symbol]);

  const commitRename = () => {
    const next = nameDraft.trim();
    if (next === symbol || symbol === 'origin') return;
    const ok = onRenameRule(symbol, next);
    if (!ok) setNameDraft(symbol);
  };

  const updateAlt = (index: number, value: string) => {
    const next = [...alternatives];
    next[index] = value;
    onAlternativesChange(symbol, next);
  };

  const altInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocusAltIndexRef = useRef<number | null>(null);

  const insertAlternativeAfter = (afterIndex: number) => {
    const next = [...alternatives];
    next.splice(afterIndex + 1, 0, '');
    pendingFocusAltIndexRef.current = afterIndex + 1;
    onAlternativesChange(symbol, next);
  };

  useEffect(() => {
    const idx = pendingFocusAltIndexRef.current;
    if (idx === null) return;
    if (idx < 0 || idx >= alternatives.length) return;
    pendingFocusAltIndexRef.current = null;
    const t = window.setTimeout(() => {
      const el = altInputRefs.current[idx];
      el?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [alternatives]);

  const removeAlt = (index: number) => {
    const next = alternatives.filter((_, i) => i !== index);
    onAlternativesChange(symbol, next.length > 0 ? next : ['']);
  };

  return (
    <div
      className={`nodrag nopan ${classes.node}`}
      onPointerDown={stopFlowPointer}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width: GRAMMAR_FLOW_NODE_WIDTH,
        minWidth: GRAMMAR_FLOW_NODE_WIDTH,
        maxWidth: GRAMMAR_FLOW_NODE_WIDTH,
        padding: 8,
        border: `1px solid ${nodeBorder}`,
        borderRadius: 8,
        background: 'var(--app-surface-2)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      {symbol === 'origin' ? (
        <Text fw={700} size="sm" mb="xs">
          origin
          <Text component="span" size="xs" c="dimmed" fw={400}>
            {' '}
            (root)
          </Text>
        </Text>
      ) : (
        <Group gap={6} wrap="nowrap" align="center" w="100%" mb={6} style={{ minWidth: 0 }}>
          <TextInput
            className="nodrag nopan"
            size="xs"
            ff="monospace"
            style={{ flex: 1, minWidth: 0 }}
            value={nameDraft}
            onPointerDown={stopFlowPointer}
            onChange={(e) => setNameDraft(e.currentTarget.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            styles={{ input: { fontWeight: 700 } }}
          />
          <ActionIcon
            className={`nodrag nopan ${classes.nodeAction}`}
            size="input-xs"
            variant="subtle"
            color="gray"
            aria-label="Delete rule"
            title="Delete rule"
            onPointerDown={stopFlowPointer}
            onClick={() => onDeleteRule(symbol)}
            style={{ flexShrink: 0 }}
          >
            <IconX size={14} />
          </ActionIcon>
        </Group>
      )}
      <Stack gap={5} w="100%">
        {alternatives.map((alt, i) => {
          const isStatic = isStaticAlternative(alt);
          return (
            <Group key={i} gap={6} wrap="nowrap" align="center" w="100%" style={{ minWidth: 0 }}>
              <Box
                component="span"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  flexShrink: 0,
                  color: isStatic ? 'var(--mantine-color-dimmed)' : 'var(--mantine-primary-color-filled)',
                }}
              >
                <Tooltip
                  label={isStatic ? 'Literal text (no #references#)' : 'Contains #rule# references'}
                  position="top"
                  withArrow
                >
                  <Box
                    component="span"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {isStatic ? <IconTypography size={15} stroke={1.5} /> : <IconBraces size={15} stroke={1.5} />}
                  </Box>
                </Tooltip>
              </Box>
              <TextInput
                className="nodrag nopan"
                size="xs"
                style={{ flex: 1, minWidth: 0 }}
                value={alt}
                onChange={(e) => updateAlt(i, e.currentTarget.value)}
                onPointerDown={stopFlowPointer}
                ff="monospace"
                placeholder='e.g. hello or #OtherRule#'
                ref={(el) => {
                  altInputRefs.current[i] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    insertAlternativeAfter(i);
                  }
                }}
              />
              <ActionIcon
                className={`nodrag nopan ${classes.altRemove}`}
                size="input-xs"
                variant="subtle"
                color="red"
                onPointerDown={stopFlowPointer}
                onClick={() => removeAlt(i)}
                aria-label="Remove alternative"
                style={{ flexShrink: 0 }}
              >
                <IconTrash size={14} />
              </ActionIcon>
          </Group>
          );
        })}
      </Stack>
      <Button
        className={`nodrag nopan ${classes.addAltBtn}`}
        size="compact-xs"
        variant="light"
        fullWidth
        justify="center"
        leftSection={<IconPlus size={14} />}
        mt="sm"
        onPointerDown={stopFlowPointer}
        onClick={() => onAddStaticAlternative(symbol)}
      >
        Add alternative
      </Button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
