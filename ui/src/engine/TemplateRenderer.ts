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
   * Renders a template by replacing all parameter references with their values
   * @param template The template to render
   * @returns The rendered content and applied parameters
   */
  render(template: GenerationTemplate): RenderResult {
    let content = template.template;
    const appliedParameters: Record<string, string> = {};
    
    // Replace all parameter references with their values
    for (const [param, value] of Object.entries(template.parameters)) {
      const regex = new RegExp(`#${param}#`, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        // Record that this parameter was applied
        appliedParameters[param] = value;
        // Replace all occurrences
        content = content.replace(regex, value);
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
