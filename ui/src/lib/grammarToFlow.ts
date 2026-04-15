import type { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';
import type { GrammarRule } from '../engine/types';
import { buildEdges } from '../engine/grammarGraphModel';

export const GRAMMAR_SYMBOL_NODE_TYPE = 'grammarSymbol' as const;

export type GrammarSymbolNodeData = {
  symbol: string;
  alternatives: string[];
  onAlternativesChange: (symbol: string, alts: string[]) => void;
  onAddStaticAlternative: (symbol: string) => void;
  /** Returns false if rename was rejected (duplicate name, invalid identifier). */
  onRenameRule: (oldName: string, newName: string) => boolean;
  /** Remove rule from grammar; must not be called for `origin`. */
  onDeleteRule: (symbol: string) => void;
};

const HEADER = 40;
const ROW = 38;
const PADDING = 24;

/** Matches dagre node width in `layoutWithDagre`. */
export const GRAMMAR_FLOW_NODE_WIDTH = 300;

/** Matches dagre node height for a given number of alternatives. */
export function estimateGrammarNodeLayoutHeight(alternativesCount: number): number {
  return PADDING + HEADER + Math.max(1, alternativesCount) * ROW;
}

/**
 * Build React Flow edges from grammar references.
 */
export function buildReactFlowEdges(grammar: GrammarRule): Edge[] {
  const list = buildEdges(grammar);
  return list.map((e, i) => ({
    id: `e-${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
  }));
}

/**
 * Nodes for each grammar key; positions are placeholders until layout runs.
 */
export function createGrammarFlowNodes(
  grammar: GrammarRule,
  callbacks: Pick<
    GrammarSymbolNodeData,
    'onAlternativesChange' | 'onAddStaticAlternative' | 'onRenameRule' | 'onDeleteRule'
  >,
): Node<GrammarSymbolNodeData>[] {
  const symbols = Object.keys(grammar).sort((a, b) => {
    if (a === 'origin') return -1;
    if (b === 'origin') return 1;
    return a.localeCompare(b);
  });

  return symbols.map((symbol) => ({
    id: symbol,
    type: GRAMMAR_SYMBOL_NODE_TYPE,
    position: { x: 0, y: 0 },
    data: {
      symbol,
      alternatives: [...grammar[symbol]],
      ...callbacks,
    },
  }));
}

/**
 * Apply Dagre TB layout. Assumes dagre node size matches estimateNodeHeight per node.
 */
export function layoutWithDagre(nodes: Node<GrammarSymbolNodeData>[], edges: Edge[]): Node<GrammarSymbolNodeData>[] {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 48, ranksep: 72, marginx: 20, marginy: 20 });

  nodes.forEach((node) => {
    const h = estimateGrammarNodeLayoutHeight(node.data.alternatives.length);
    g.setNode(node.id, { width: GRAMMAR_FLOW_NODE_WIDTH, height: h });
  });

  edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const w = dagreNode.width ?? GRAMMAR_FLOW_NODE_WIDTH;
    const h = dagreNode.height ?? estimateGrammarNodeLayoutHeight(node.data.alternatives.length);
    return {
      ...node,
      position: {
        x: dagreNode.x - w / 2,
        y: dagreNode.y - h / 2,
      },
    };
  });
}

export function buildLaidOutFlow(
  grammar: GrammarRule,
  callbacks: Pick<
    GrammarSymbolNodeData,
    'onAlternativesChange' | 'onAddStaticAlternative' | 'onRenameRule' | 'onDeleteRule'
  >,
): { nodes: Node<GrammarSymbolNodeData>[]; edges: Edge[] } {
  const nodes = createGrammarFlowNodes(grammar, callbacks);
  const edges = buildReactFlowEdges(grammar);
  const layouted = layoutWithDagre(nodes, edges);
  return { nodes: layouted, edges };
}

/** Center of a laid-out grammar node in flow coordinates (top-left position + layout size). */
export function getGrammarFlowNodeCenter(
  node: Pick<Node<GrammarSymbolNodeData>, 'position' | 'id'>,
  grammar: GrammarRule,
): { x: number; y: number } {
  const alts = grammar[node.id]?.length ?? 1;
  const h = estimateGrammarNodeLayoutHeight(alts);
  return {
    x: node.position.x + GRAMMAR_FLOW_NODE_WIDTH / 2,
    y: node.position.y + h / 2,
  };
}
