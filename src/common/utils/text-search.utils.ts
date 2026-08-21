const VIETNAMESE_SEARCH_REPLACEMENTS = [
  {
    base: 'a',
    chars:
      '\u00E0\u00E1\u1EA1\u1EA3\u00E3\u00E2\u1EA7\u1EA5\u1EAD\u1EA9\u1EAB\u0103\u1EB1\u1EAF\u1EB7\u1EB3\u1EB5',
  },
  {
    base: 'e',
    chars: '\u00E8\u00E9\u1EB9\u1EBB\u1EBD\u00EA\u1EC1\u1EBF\u1EC7\u1EC3\u1EC5',
  },
  {
    base: 'i',
    chars: '\u00EC\u00ED\u1ECB\u1EC9\u0129',
  },
  {
    base: 'o',
    chars:
      '\u00F2\u00F3\u1ECD\u1ECF\u00F5\u00F4\u1ED3\u1ED1\u1ED9\u1ED5\u1ED7\u01A1\u1EDD\u1EDB\u1EE3\u1EDF\u1EE1',
  },
  {
    base: 'u',
    chars: '\u00F9\u00FA\u1EE5\u1EE7\u0169\u01B0\u1EEB\u1EE9\u1EF1\u1EED\u1EEF',
  },
  {
    base: 'y',
    chars: '\u1EF3\u00FD\u1EF5\u1EF7\u1EF9',
  },
  {
    base: 'd',
    chars: '\u0111',
  },
];

const VIETNAMESE_SEARCH_SOURCE = VIETNAMESE_SEARCH_REPLACEMENTS.map(
  (item) => item.chars,
).join('');

const VIETNAMESE_SEARCH_TARGET = VIETNAMESE_SEARCH_REPLACEMENTS.map((item) =>
  item.base.repeat(item.chars.length),
).join('');

export function normalizeSearchKeyword(keyword: string): string {
  return keyword
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0111\u0110]/g, (character) =>
      character === '\u0110' ? 'D' : 'd',
    )
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildNormalizedSearchSqlExpression(
  expression: string,
): string {
  return [
    'TRANSLATE(',
    `LOWER(REGEXP_REPLACE(COALESCE(CAST(${expression} AS text), ''), '\\s+', ' ', 'g')), `,
    `'${VIETNAMESE_SEARCH_SOURCE}', `,
    `'${VIETNAMESE_SEARCH_TARGET}'`,
    ')',
  ].join('');
}

export function buildNormalizedContainsCondition(
  expression: string,
  parameterName = 'qNormalized',
): string {
  return `${buildNormalizedSearchSqlExpression(expression)} LIKE :${parameterName}`;
}
