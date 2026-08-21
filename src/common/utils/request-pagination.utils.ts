export function transfomerPagination(value: any): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parseValue = Number.parseInt(value, 10);

  return Number.isNaN(parseValue) ? parseValue : parseValue;
}
