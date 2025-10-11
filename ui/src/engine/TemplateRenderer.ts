import type { GenerationTemplate } from './types';

export interface RenderResult {
  content: string;
  appliedParameters: Record<string, string>;
}

/**
 * Renders GenerationTemplate objects into final content
 * Handles parameter replacement and missing symbol detection
 */
export class TemplateRenderer {
  /**
   * Renders a template by replacing parameter references in the order they were added
   * @param template The template to render
   * @returns The rendered content and applied parameters
   */
  render(template: GenerationTemplate): RenderResult {
    let content = template.template;
    const appliedParameters: Record<string, string> = {};
    
    // Replace parameters in the exact order they appear in the array
    for (const param of template.parameters) {
      const regex = new RegExp(`#${param.symbol}#`, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        // Record that this parameter was applied
        appliedParameters[param.symbol] = param.value;
        // Replace all occurrences
        content = content.replace(regex, param.value);
      }
    }
    
    // Handle missing symbols - replace any remaining #symbol# with ((missing:symbol))
    const missingSymbolRegex = /#([^#]+)#/g;
    content = content.replace(missingSymbolRegex, '((missing:$1))');
    
    return {
      content,
      appliedParameters
    };
  }
}
