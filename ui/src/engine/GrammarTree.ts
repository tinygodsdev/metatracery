// import type {
//   GrammarRule,
//   GenerationTemplate,
// } from './types';
// import { TemplateRenderer } from './TemplateRenderer';

// interface GrammarNode {
//   symbol: string;
//   nodeId: string; // unique identifier for this node instance
//   children: GrammarNode[];
//   // alternatives: string[];
//   // isParameter: boolean; // true if has multiple alternatives
//   // isSequence: boolean; // true if all children are used together (not alternatives)
// }

// export class GrammarTree {
//   private grammar: GrammarRule;
//   private rootNode: GrammarNode | null = null;
//   // public templateRenderer: TemplateRenderer;

//   constructor(grammar: GrammarRule) {
//     this.grammar = grammar;
//     //   this.templateRenderer = new TemplateRenderer();
//     this.buildTree();
//   }

//   private buildTree(): void {
//     const originRule = this.grammar.origin?.[0];
//     if (!originRule) {
//       // Handle empty grammar gracefully
//       this.rootNode = null;
//       return;
//     }

//     this.rootNode = this.buildNode('origin', originRule);
//   }

//   private buildNode(symbol: string, _: string, parentPath: string = '', positionInParent: number = 0): GrammarNode {
//     const nodeId = parentPath ? `${parentPath}_${symbol}_${positionInParent}` : symbol;

//   }
// }
