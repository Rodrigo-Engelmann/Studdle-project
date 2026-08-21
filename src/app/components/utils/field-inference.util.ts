import { FieldType } from '../enums/dialog.enums';
import { FormFieldConfig } from '../models/dialog.models';

/**
 * Converte um objeto comum em uma lista de campos.
 *
 *   inferFields({ titulo: '', duracao: 0, publicado: false })
 *   → [ { key: 'titulo', type: TEXT }, { key: 'duracao', type: NUMBER }, ... ]
 *
 * Serve para protótipos rápidos e telas simples. Quando precisar de select,
 * validação específica ou ordem/rótulos diferentes, use `overrides` — ou
 * escreva o array de FormFieldConfig na mão, que continua sendo o caminho
 * recomendado para telas definitivas.
 */
export function inferFields(
  model: Record<string, unknown>,
  overrides: Record<string, Partial<FormFieldConfig>> = {},
): FormFieldConfig[] {
  return Object.entries(model).map(([key, value]) => {
    const base: FormFieldConfig = {
      key,
      label: humanize(key),
      type: inferType(key, value),
      value,
    };

    // o override sempre vence a inferência
    return { ...base, ...overrides[key] };
  });
}

/** "dataPublicacao" → "Data publicacao" | "url_video" → "Url video" */
function humanize(key: string): string {
  const words = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Deduz o tipo pelo valor e, como desempate, pelo nome da propriedade. */
function inferType(key: string, value: unknown): FieldType {
  if (typeof value === 'boolean') return FieldType.CHECKBOX;
  if (typeof value === 'number') return FieldType.NUMBER;
  if (value instanceof Date) return FieldType.DATE;
  if (Array.isArray(value)) return FieldType.MULTI_SELECT;

  const name = key.toLowerCase();
  if (name.includes('email')) return FieldType.EMAIL;
  if (name.includes('senha') || name.includes('password')) return FieldType.PASSWORD;
  if (name.includes('url') || name.includes('link')) return FieldType.URL;
  if (name.includes('data') || name.includes('date')) return FieldType.DATE;
  if (name.includes('descricao') || name.includes('description') || name.includes('obs')) {
    return FieldType.TEXTAREA;
  }

  return FieldType.TEXT;
}
