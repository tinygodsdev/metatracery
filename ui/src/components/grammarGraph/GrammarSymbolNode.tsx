import { useEffect, useState } from 'react';
import type { PointerEvent } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Stack, TextInput, Button, Group, Badge, ActionIcon, Text } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { isStaticAlternative } from '../../engine/grammarGraphModel';
import type { GrammarSymbolNodeData } from '../../lib/grammarToFlow';

/** Stops React Flow from capturing pointer events for pan/drag on inputs and buttons. */
const stopFlowPointer = (e: PointerEvent) => {
  e.stopPropagation();
};

export function GrammarSymbolNode({ data }: NodeProps<Node<GrammarSymbolNodeData>>) {
  const { symbol, alternatives, onAlternativesChange, onAddStaticAlternative, onRenameRule } = data;

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

  const removeAlt = (index: number) => {
    const next = alternatives.filter((_, i) => i !== index);
    onAlternativesChange(symbol, next.length > 0 ? next : ['']);
  };

  return (
    <div
      className="nodrag nopan"
      onPointerDown={stopFlowPointer}
      style={{
        minWidth: 260,
        maxWidth: 320,
        padding: 10,
        border: '1px solid var(--mantine-color-gray-4)',
        borderRadius: 8,
        background: 'var(--mantine-color-body)',
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
        <TextInput
          className="nodrag nopan"
          label="Rule name"
          size="xs"
          mb="xs"
          ff="monospace"
          value={nameDraft}
          onPointerDown={stopFlowPointer}
          onChange={(e) => setNameDraft(e.currentTarget.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
        />
      )}
      <Stack gap={6}>
        {alternatives.map((alt, i) => (
          <Group key={i} gap={6} wrap="nowrap" align="flex-start">
            <Badge size="xs" variant="light" color={isStaticAlternative(alt) ? 'gray' : 'violet'}>
              {isStaticAlternative(alt) ? 'static' : 'dynamic'}
            </Badge>
            <TextInput
              className="nodrag nopan"
              size="xs"
              style={{ flex: 1, minWidth: 0 }}
              value={alt}
              onChange={(e) => updateAlt(i, e.currentTarget.value)}
              onPointerDown={stopFlowPointer}
              ff="monospace"
              placeholder='e.g. hello or #OtherRule#'
            />
            <ActionIcon
              className="nodrag nopan"
              size="sm"
              variant="subtle"
              color="red"
              onPointerDown={stopFlowPointer}
              onClick={() => removeAlt(i)}
              aria-label="Remove alternative"
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
      <Button
        className="nodrag nopan"
        size="xs"
        variant="light"
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
