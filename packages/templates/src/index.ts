import basicTemplate from './templates/basic.json';
import webTemplate from './templates/web.json';
import apiTemplate from './templates/api.json';
import fullstackTemplate from './templates/fullstack.json';

export interface Template {
  name: string;
  description: string;
  files: Record<string, any>;
  src?: Record<string, string>;
}

export const templates: Record<string, Template> = {
  basic: basicTemplate as Template,
  web: webTemplate as Template,
  api: apiTemplate as Template,
  fullstack: fullstackTemplate as Template,
};

export function getTemplate(name: string): Template | undefined {
  return templates[name];
}

export function listTemplates(): Array<{ name: string; description: string }> {
  return Object.entries(templates).map(([name, template]) => ({
    name,
    description: template.description,
  }));
}