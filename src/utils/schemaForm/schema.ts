export function fieldType(schema: Record<string, unknown>): string {
  let type = schema['type'];
  if (schema['enum']) type = 'enum';
  if (schema['format']) type += '-' + schema['format'];
  if (schema['hidden']) type = 'hidden';
  if (schema['editor']) type = schema['editor'];
  switch (type) {
    case 'string-date-time':
    case 'string-date':
    case 'string-time':
    case 'string-email':
    case 'string-password':
    case 'number-currency':
      return schema['format'] as string;
    default:
      return type as string;
  }
}
