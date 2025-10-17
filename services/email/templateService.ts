// @ts-nocheck
/**
 * EMAIL TEMPLATE SERVICE
 * Manages email templates with multi-language support
 */

import type {
  EmailTemplate,
  EmailTemplateType,
  EmailLanguage,
} from '../../types/email';
import { supabase } from '@/lib/supabase';

class TemplateService {
  /**
   * Create or update email template
   */
  async saveTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .upsert({
        type: template.type,
        language: template.language,
        subject: template.subject,
        html_content: template.htmlContent,
        text_content: template.textContent,
        variables: template.variables,
        is_active: template.isActive,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'type,language',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }

    return data as EmailTemplate;
  }

  /**
   * Get template by type and language
   */
  async getTemplate(
    type: EmailTemplateType,
    language: EmailLanguage = 'nl'
  ): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', type)
      .eq('language', language)
      .eq('isActive', true)
      .single();

    if (error) {
      console.error('Failed to get template:', error);
      return null;
    }

    return data as EmailTemplate;
  }

  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('type', { ascending: true })
      .order('language', { ascending: true });

    if (error) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }

    return data as EmailTemplate[];
  }

  /**
   * Deactivate template
   */
  async deactivateTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      } as any)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to deactivate template: ${error.message}`);
    }
  }

  /**
   * Extract variables from template content
   */
  extractVariables(content: string): string[] {
    const regex = /{{\\s*([a-zA-Z0-9_]+)\\s*}}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Validate template (check all variables are provided)
   */
  validateTemplate(
    template: EmailTemplate,
    variables: Record<string, string | number>
  ): { valid: boolean; missing: string[] } {
    const required = template.variables;
    const provided = Object.keys(variables);
    const missing = required.filter((v) => !provided.includes(v));

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

export const templateService = new TemplateService();
