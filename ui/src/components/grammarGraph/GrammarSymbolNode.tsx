import { useEffect, useState } from 'react';
import type { PointerEvent } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import {
  Stack,
  TextInput,
  Button,
  Group,
  Badge,
  ActionIcon,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { isStaticAlternative } from '../../engine/grammarGraphModel';
import type { GrammarSymbolNodeData } from '../../lib/grammarToFlow';

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

  const removeAlt = (index: number) => {
    const next = alternatives.filter((_, i) => i !== index);
    onAlternativesChange(symbol, next.length > 0 ? next : ['']);
  };

  return (
    <div
      className="nodrag nopan"
      onPointerDown={stopFlowPointer}
      style={{
        position: 'relative',
        minWidth: 240,
        maxWidth: 300,
        padding: 8,
        paddingRight: symbol !== 'origin' ? 30 : 8,
        border: `1px solid ${nodeBorder}`,
        borderRadius: 8,
        background: 'var(--mantine-color-body)',
      }}
    >
      {symbol !== 'origin' && (
        <ActionIcon
          className="nodrag nopan"
          size="sm"
          variant="subtle"
          color="gray"
          aria-label="Delete rule"
          title="Delete rule"
          onPointerDown={stopFlowPointer}
          onClick={() => onDeleteRule(symbol)}
          style={{ position: 'absolute', top: 6, right: 6, zIndex: 1 }}
        >
          <IconX size={14} />
        </ActionIcon>
      )}
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
          size="xs"
          mb={6}
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
          styles={{ input: { fontWeight: 700 } }}
        />
      )}
      <Stack gap={5}>
        {alternatives.map((alt, i) => (
          <Group key={i} gap={6} wrap="nowrap" align="center" justify="flex-start">
            <Badge
              size="xs"
              variant="light"
              color={isStaticAlternative(alt) ? 'gray' : 'teal'}
              style={{ flexShrink: 0 }}
            >
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
